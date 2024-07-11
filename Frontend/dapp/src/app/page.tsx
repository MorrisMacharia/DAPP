"use client"

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import MyDApp from '../../contracts/MyDApp.json';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';

const ALCHEMY_API_URL = process.env.REACT_APP_ALCHEMY_API_URL || '';

const Home: React.FC = () => {
    const [account, setAccount] = useState<string>('');
    const [balance, setBalance] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [toAddress, setToAddress] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [txHash, setTxHash] = useState<string>('');

    useEffect(() => {
        const loadProvider = async () => {
            if (typeof window !== 'undefined') {
                if ((window as any).ethereum) {
                    // Request accounts using MetaMask
                    try {
                        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                        setAccount(accounts[0]);

                        // Use Alchemy as the provider
                        const alchemyProvider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/-Dc7kjcZZos9SS80gLSZFyxedUjGaQzW");
                        const balance = await alchemyProvider.getBalance(accounts[0]);
                        setBalance(ethers.utils.formatEther(balance));

                        const networkId = (await alchemyProvider.getNetwork()).chainId;
                        const deployedNetwork = (MyDApp as any).networks[networkId];
                        if (deployedNetwork) {
                            const contractInstance = new ethers.Contract(
                                deployedNetwork.address,
                                MyDApp.abi,
                                alchemyProvider.getSigner(accounts[0])
                            );
                            setContract(contractInstance);
                        } else {
                            console.log('MyDApp contract not deployed to detected network.');
                        }
                    } catch (error) {
                        console.error('Error requesting accounts or setting provider:', error);
                    }
                } else {
                    console.error('MetaMask not found or ALCHEMY_API_URL is not set');
                }
            }
        };

        loadProvider();
    }, []);

    const sendCrypto = async () => {
        if (contract) {
            try {
                const tx = await contract.sendCrypto(
                    toAddress,
                    ethers.utils.parseEther(amount),
                    message,
                    { value: ethers.utils.parseEther(amount) }
                );
                await tx.wait();
                setTxHash(tx.hash);
            } catch (error) {
                console.error('Error sending crypto:', error);
            }
        }
    };

    return (
        <div>
            <h1>My DApp</h1>
            <p>Account: {account}</p>
            <p>Balance: {balance} ETH</p>
            <input
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <input
                type="text"
                placeholder="To Address"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
            />
            <input
                type="text"
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button 
            onClick={sendCrypto}>Send Crypto</button>
            {txHash && <p>Transaction Hash: {txHash}</p>}
        </div>
    );
};

export default Home;
