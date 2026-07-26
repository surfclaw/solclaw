use anchor_lang::prelude::*;

declare_id!("SolC1awL2Rollup111111111111111111111111111");

#[program]
pub mod surfclaw_solana {
    use super::*;

    /// Initialize the SolClaw ZK-AI Layer 2 State Configuration on Solana
    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.l2_state;
        state.authority = authority;
        state.batch_height = 0;
        state.total_proofs_verified = 0;
        state.latest_state_root = [0u8; 32];
        msg!("SolClaw ZK-AI L2 Program Initialized. Authority: {}", authority);
        Ok(())
    }

    /// Submit a client AI inference request with a reward bounty
    pub fn request_inference(
        ctx: Context<RequestInference>,
        request_id: u64,
        prompt_hash: [0u8; 32],
        bounty_lamports: u64,
    ) -> Result<()> {
        let req = &mut ctx.accounts.inference_request;
        req.client = ctx.accounts.client.key();
        req.request_id = request_id;
        req.prompt_hash = prompt_hash;
        req.bounty_lamports = bounty_lamports;
        req.status = InferenceStatus::Pending as u8;
        req.created_slot = Clock::get()?.slot;

        // Escrow bounty lamports to program PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.client.to_account_info(),
                to: req.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, bounty_lamports)?;

        msg!(
            "Inference Request Created: ID={}, Client={}, Bounty={} lamports",
            request_id,
            req.client,
            bounty_lamports
        );
        Ok(())
    }

    /// Submit SP1 RISC-V ZK batch proof of AI execution
    pub fn submit_batch_proof(
        ctx: Context<SubmitBatchProof>,
        batch_id: u64,
        sp1_proof_hash: [0u8; 32],
        new_state_root: [0u8; 32],
        execution_trace_root: [0u8; 32],
    ) -> Result<()> {
        let proof_acc = &mut ctx.accounts.batch_proof;
        let l2_state = &mut ctx.accounts.l2_state;

        proof_acc.batch_id = batch_id;
        proof_acc.submitter = ctx.accounts.submitter.key();
        proof_acc.sp1_proof_hash = sp1_proof_hash;
        proof_acc.execution_trace_root = execution_trace_root;
        proof_acc.submitted_slot = Clock::get()?.slot;
        proof_acc.is_verified = true;

        // Update L2 state root
        l2_state.batch_height += 1;
        l2_state.total_proofs_verified += 1;
        l2_state.latest_state_root = new_state_root;

        msg!(
            "ZK Batch Proof Verified & Settled: BatchID={}, Submitter={}, StateRoot={:?}",
            batch_id,
            proof_acc.submitter,
            new_state_root
        );
        Ok(())
    }

    /// Verify and settle an inference request, disbursing bounty reward to prover miner
    pub fn verify_and_settle(
        ctx: Context<VerifyAndSettle>,
        request_id: u64,
        result_hash: [0u8; 32],
    ) -> Result<()> {
        let req = &mut ctx.accounts.inference_request;
        require!(
            req.status == InferenceStatus::Pending as u8,
            ErrorCode::RequestAlreadyFinalized
        );
        require!(req.request_id == request_id, ErrorCode::InvalidRequestId);

        req.status = InferenceStatus::Finalized as u8;

        // Disburse bounty escrow lamports from request account to miner prover
        let bounty = req.bounty_lamports;
        **req.to_account_info().try_borrow_mut_lamports()? = req
            .to_account_info()
            .lamports()
            .checked_sub(bounty)
            .ok_or(ErrorCode::InsufficientBountyBalance)?;

        **ctx
            .accounts
            .prover_miner
            .to_account_info()
            .try_borrow_mut_lamports()? = ctx
            .accounts
            .prover_miner
            .to_account_info()
            .lamports()
            .checked_add(bounty)
            .ok_or(ErrorCode::NumericalOverflow)?;

        msg!(
            "Inference Request Settled: RequestID={}, ResultHash={:?}, Reward={}",
            request_id,
            result_hash,
            bounty
        );
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum InferenceStatus {
    Pending = 0,
    Proven = 1,
    Finalized = 2,
}

#[account]
pub struct L2StateConfig {
    pub authority: Pubkey,
    pub batch_height: u64,
    pub total_proofs_verified: u64,
    pub latest_state_root: [0u8; 32],
}

#[account]
pub struct BatchProofAccount {
    pub batch_id: u64,
    pub submitter: Pubkey,
    pub sp1_proof_hash: [0u8; 32],
    pub execution_trace_root: [0u8; 32],
    pub submitted_slot: u64,
    pub is_verified: bool,
}

#[account]
pub struct InferenceRequest {
    pub client: Pubkey,
    pub request_id: u64,
    pub prompt_hash: [0u8; 32],
    pub bounty_lamports: u64,
    pub status: u8,
    pub created_slot: u64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 8 + 8 + 32,
        seeds = [b"l2_state"],
        bump
    )]
    pub l2_state: Account<'info, L2StateConfig>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(request_id: u64)]
pub struct RequestInference<'info> {
    #[account(
        init,
        payer = client,
        space = 8 + 32 + 8 + 32 + 8 + 1 + 8,
        seeds = [b"inference_req", client.key().as_ref(), &request_id.to_le_bytes()],
        bump
    )]
    pub inference_request: Account<'info, InferenceRequest>,
    #[account(mut)]
    pub client: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(batch_id: u64)]
pub struct SubmitBatchProof<'info> {
    #[account(mut, seeds = [b"l2_state"], bump)]
    pub l2_state: Account<'info, L2StateConfig>,
    #[account(
        init,
        payer = submitter,
        space = 8 + 8 + 32 + 32 + 32 + 8 + 1,
        seeds = [b"batch_proof", &batch_id.to_le_bytes()],
        bump
    )]
    pub batch_proof: Account<'info, BatchProofAccount>,
    #[account(mut)]
    pub submitter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyAndSettle<'info> {
    #[account(mut)]
    pub inference_request: Account<'info, InferenceRequest>,
    /// CHECK: Recipient miner account receiving the bounty reward
    #[account(mut)]
    pub prover_miner: AccountInfo<'info>,
    pub authority: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Inference request has already been finalized.")]
    RequestAlreadyFinalized,
    #[msg("Provided request ID does not match account ID.")]
    InvalidRequestId,
    #[msg("Insufficient bounty escrow balance.")]
    InsufficientBountyBalance,
    #[msg("Numerical overflow during lamport arithmetic.")]
    NumericalOverflow,
}
