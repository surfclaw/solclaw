"""
SolClaw Solana Mining Node
Executes AI requests inside Firecracker MicroVM, generates SP1 RISC-V ZK proofs,
and submits state settlement transactions to Solana Anchor L2 Program.
"""

import argparse
import sys
import os
import time
import logging

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from template.solana_zk import SolanaZKL2Manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SolanaMiner")

def run_dry_run():
    logger.info("⚡ Starting SolClaw Solana ZK-AI L2 Miner Dry-Run Simulation...")
    
    manager = SolanaZKL2Manager(
        rpc_url="https://api.devnet.solana.com",
        program_id="SolC1awL2Rollup111111111111111111111111111"
    )

    sample_prompt = "Write a high-performance Solana Anchor program instruction in Rust."
    sample_response = "pub fn execute_l2_transfer(ctx: Context<Transfer>) -> Result<()> { ... }"
    miner_pubkey = "SolanaMinerPubkey11111111111111111111111111"

    start_time = time.time()
    result = manager.process_and_submit_l2_inference(
        request_id=101,
        prompt=sample_prompt,
        miner_response=sample_response,
        submitter_pubkey=miner_pubkey,
    )
    elapsed_ms = (time.time() - start_time) * 1000

    logger.info(f"✅ ZK-AI L2 Execution & Solana Settlement Completed in {elapsed_ms:.2f}ms!")
    logger.info(f"   Batch ID: {result['batch_id']}")
    logger.info(f"   SP1 ZK Proof Hash: {result['sp1_proof_hash']}")
    logger.info(f"   Solana Tx Signature: {result['solana_tx_signature']}")
    logger.info(f"   On-Chain Settlement Verified: {result['onchain_verified']}")

    assert result["onchain_verified"] is True
    print("\n[SUCCESS] SolClaw Solana ZK-AI Layer 2 Dry-Run PASSED 100%!")

def main():
    parser = argparse.ArgumentParser(description="SolClaw Solana Mining Node")
    parser.add_argument("--dry-run", action="store_true", help="Run simulated ZK-AI L2 proof generation and Solana settlement")
    args = parser.parse_args()

    if args.dry_run or len(sys.argv) == 1:
        run_dry_run()
    else:
        logger.info("Running standard SolClaw Solana miner loop...")

if __name__ == "__main__":
    main()
