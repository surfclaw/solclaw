"""
Unit & Integration Tests for SolClaw Solana ZK-AI Layer 2 Rollup Architecture
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from template.solana_zk import SolanaZKL2Manager

class TestSolanaZKL2(unittest.TestCase):
    def setUp(self):
        self.manager = SolanaZKL2Manager(
            rpc_url="https://api.devnet.solana.com",
            program_id="SolC1awL2Rollup111111111111111111111111111"
        )

    def test_l2_inference_zk_proof_and_solana_submission(self):
        request_id = 999
        prompt = "Explain Solana Token-2022 confidential transfers."
        miner_response = "Token-2022 uses zero-knowledge ElGamal encryption and Twisted Edwards curve proofs."
        submitter_pubkey = "TestSubmitter1111111111111111111111111111"

        res = self.manager.process_and_submit_l2_inference(
            request_id=request_id,
            prompt=prompt,
            miner_response=miner_response,
            submitter_pubkey=submitter_pubkey,
        )

        self.assertEqual(res["status"], "Finalized")
        self.assertTrue(res["onchain_verified"])
        self.assertTrue(res["solana_tx_signature"].startswith("solclaw_tx_sig_"))
        self.assertIsNotNone(res["sp1_proof_hash"])
        self.assertIsNotNone(res["new_state_root"])

if __name__ == "__main__":
    unittest.main()
