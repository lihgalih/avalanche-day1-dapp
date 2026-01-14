"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { SIMPLE_STORAGE_ABI } from "./abi";

const CONTRACT_ADDRESS = "0x053E2B9c2dca9d34915D932B469C3f33E405Ba5E";

export default function Home() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [value, setValue] = useState("");
  const [input, setInput] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // 🔌 Connect Wallet
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Core Wallet not found");
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Switch to Fuji
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xA869" }], // 43113
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xA869",
              chainName: "Avalanche Fuji",
              rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
              nativeCurrency: {
                name: "AVAX",
                symbol: "AVAX",
                decimals: 18,
              },
              blockExplorerUrls: ["https://subnets-test.avax.network/c-chain"],
            },
          ],
        });
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const net = await provider.getNetwork();

    setAddress(await signer.getAddress());
    setNetwork(net.chainId === 43113n ? "Avalanche Fuji" : "Wrong Network");
  }

  // 📖 Read getValue()
  async function readValue() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      SIMPLE_STORAGE_ABI,
      provider
    );

    const v = await contract.getValue();
    setValue(v.toString());
  }

  // ✍️ Write setValue()
  async function setNewValue() {
    try {
      setTxStatus("Waiting for wallet...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        SIMPLE_STORAGE_ABI,
        signer
      );

      const tx = await contract.setValue(input);
      setTxStatus("Tx sent: " + tx.hash);

      await tx.wait();
      setTxStatus("Confirmed");

      readValue();
    } catch (err) {
      setTxStatus("Transaction failed");
    }
  }

  return (
    <main className="container">
      <h1>Avalanche dApp</h1>

      <button onClick={connectWallet}>Connect Wallet</button>

      <div className="card">
        <p><b>Address:</b> {address || "-"}</p>
        <p><b>Network:</b> {network || "-"}</p>
      </div>

      <button onClick={readValue}>Read Value</button>

      <div className="card">
        <p><b>Stored Value:</b> {value || "-"}</p>
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter new value"
      />

      <button onClick={setNewValue}>Set Value</button>

      <div className="card">
        <p>{txStatus}</p>
      </div>
    </main>
  );

}
