"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { SIMPLE_STORAGE_ABI } from "./abi";

const CONTRACT_ADDRESS = "0x053E2B9c2dca9d34915D932B469C3f33E405Ba5E";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Home() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("");

  // 🔹 On-chain (wallet)
  const [value, setValue] = useState("");
  const [input, setInput] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // 🔹 Backend
  const [backendValue, setBackendValue] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [backendStatus, setBackendStatus] = useState("");

  // 🔌 Connect Wallet
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Core Wallet not found");
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xA869" }], // Fuji
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

  // 📖 Read langsung ke blockchain (Day 3)
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

  // ✍️ Write via wallet (Day 3)
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

  // 🌐 Read via Backend API (Day 5)
  async function loadFromBackend() {
    if (!BACKEND_URL) {
      alert("Backend URL not set");
      return;
    }

    try {
      setBackendStatus("Loading from backend...");

      console.log("Fetching from:", BACKEND_URL);

      const valueRes = await fetch(`${BACKEND_URL}/blockchain/value`);
      console.log("Value status:", valueRes.status);

      const eventsRes = await fetch(`${BACKEND_URL}/blockchain/events`);
      console.log("Events status:", eventsRes.status);

      if (!valueRes.ok || !eventsRes.ok) {
        throw new Error("Backend response not OK");
      }

      const valueJson = await valueRes.json();
      const eventsJson = await eventsRes.json();

      console.log("Value:", valueJson);
      console.log("Events:", eventsJson);

      setBackendValue(valueJson);
      setEvents(eventsJson);
      setBackendStatus("Loaded from backend");
    } catch (err) {
      console.error("Backend fetch error:", err);
      setBackendStatus("Failed to load backend data");
    }
  }


  return (
    <main className="container">
      <h1>Avalanche Full Stack dApp</h1>

      <button onClick={connectWallet}>Connect Wallet</button>

      <div className="card">
        <p><b>Address:</b> {address || "-"}</p>
        <p><b>Network:</b> {network || "-"}</p>
      </div>

      {/* ===== On-chain (Wallet) ===== */}
      <h2>On-chain (Wallet)</h2>

      <button onClick={readValue}>Read Value (Blockchain)</button>

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

      {/* ===== Backend API ===== */}
      <h2>Backend API (NestJS + viem)</h2>

      <button onClick={loadFromBackend}>Load from Backend API</button>

      <div className="card">
        <p><b>Status:</b> {backendStatus}</p>
        <pre>{JSON.stringify(backendValue, null, 2)}</pre>
      </div>

      <div className="card">
        <h3>Events</h3>
        <pre>{JSON.stringify(events, null, 2)}</pre>
      </div>
    </main>
  );
}
