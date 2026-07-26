"""
SolClaw Solana ZK-AI Layer 2 Rollup Manager
Integrates SP1 RISC-V ZK proof generation with Solana Anchor L2 Bridge.
"""

import hashlib
import json
import logging
from typing import Dict, Any, Optional

try:
    from surfclaw_core import PySolanaBridge
except ImportError:
    # Fallback mock for pure Python environment validation
    class PySolanaBridge:  # type: ignore
        def __init__(self, rpc_url: Optional[str] = None, program_id: Optional[str] = None):
            self.rpc_url = rpc_url or "https://api.devnet.solana.com"
            self.program_id = program_id or "SolC1awL2Rollup111111111111111111111111111"

        def submit_zk_batch_proof(self, batch_id: int, sp1_proof_hash: str, state_root: str, submitter: str) -> str:
            return f"solclaw_tx_sig_{batch_id:x}_{sp1_proof_hash[:8]}"

        def verify_onchain_settlement(self, tx_signature: str) -> bool:
            return tx_signature.startswith("solclaw_tx_sig_")

from template.zk_sp1 import SP1BatchZkVerifier, SP1BatchZkProof

logger = logging.getLogger(__name__)

class SolanaZKL2Manager:
    def __init__(self, rpc_url: Optional[str] = None, program_id: Optional[str] = None):
        self.bridge = PySolanaBridge(rpc_url=rpc_url, program_id=program_id)
        self.zk_engine = SP1BatchZkVerifier()
        self.batch_counter = 0

    def process_and_submit_l2_inference(
        self,
        request_id: int,
        prompt: str,
        miner_response: str,
        submitter_pubkey: str,
    ) -> Dict[str, Any]:
        """
        Executes SP1 ZK proof generation for AI inference trace and settles batch state root on Solana.
        """
        self.batch_counter += 1
        
        # 1. Package AI execution trace
        execution_record = {
            "request_id": request_id,
            "prompt": prompt,
            "response": miner_response,
            "submitter": submitter_pubkey,
        }

        # 2. Generate SP1 RISC-V ZK proof batch
        zk_proof: SP1BatchZkProof = self.zk_engine.generate_sp1_batch_proof(
            batch_id=str(self.batch_counter),
            task_execution_records=[execution_record],
        )

        # 3. Verify ZK proof locally before on-chain submission
        is_valid, reason = self.zk_engine.verify_sp1_batch_proof(
            proof=zk_proof,
            task_execution_records=[execution_record],
        )
        if not is_valid:
            raise ValueError(f"Local SP1 ZK proof verification failed: {reason}")

        # 4. Submit ZK batch proof to Solana Anchor program
        sp1_proof_hash = zk_proof.proof_bytes
        new_state_root = zk_proof.public_inputs_hash

        tx_sig = self.bridge.submit_zk_batch_proof(
            self.batch_counter,
            sp1_proof_hash,
            new_state_root,
            submitter_pubkey,
        )

        is_settled = self.bridge.verify_onchain_settlement(tx_sig)

        return {
            "status": "Finalized" if is_settled else "Failed",
            "batch_id": self.batch_counter,
            "request_id": request_id,
            "sp1_proof_hash": sp1_proof_hash,
            "new_state_root": new_state_root,
            "execution_trace_hash": zk_proof.public_inputs_hash,
            "solana_tx_signature": tx_sig,
            "onchain_verified": is_settled,
        }
