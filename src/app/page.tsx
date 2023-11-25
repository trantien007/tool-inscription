"use client";

import classNames from "classnames";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Chain,
  Hex,
  PrivateKeyAccount,
  createWalletClient,
  http,
  isAddress,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  avalanche,
  bsc,
  mainnet,
  polygon,
  base,
  arbitrum,
  zkSync,
  linea,
  okc,
  fantom,
  opBNB,
  celo,
  confluxESpace,
} from "viem/chains";

const chains = {
  eth: mainnet,
  bsc,
  polygon,
  avalanche,
  base,
  arbitrum,
  zkSync,
  linea,
  okc,
  fantom,
  opBNB,
  celo,
  confluxESpace,
};

type ChainKey = keyof typeof chains;

const example =
  'data:,{"p":"asc-20","op":"mint","tick":"aval","amt":"100000000"}';

export default function Home() {
  const [accounts, setAccounts] = useState<PrivateKeyAccount[]>([]);
  const [toAddress, setToAddress] = useState<Hex>();
  const [inscription, setInscription] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const [timer, setTimer] = useState<NodeJS.Timeout>();
  const [rpc, setRpc] = useState<string>();
  const [intervalTime, setIntervalTime] = useState<number>(1000);
  const [chain, setChain] = useState<Chain>(mainnet);

  const handleLog = (log: string, state: string = "success") => {
    return `${new Date().toLocaleString()} ${
      state === "success" ? "✅" : state === "error" ? "❌" : ""
    } => ${log}`;
  };

  const handleAddress = (address: Hex) => {
    const prefix = address.slice(0, 6);
    const suffix = address.slice(-4);
    return `${prefix}...${suffix}`;
  };

  const run = useCallback(() => {
    if (accounts.length === 0) {
      setLogs((logs) => [handleLog("没有私钥", "error"), ...logs]);
      setRunning(false);
      return;
    }

    if (!toAddress) {
      setLogs((logs) => [handleLog("没有地址", "error"), ...logs]);
      setRunning(false);
      return;
    }

    if (!inscription) {
      setLogs((logs) => [handleLog("没有铭文", "error"), ...logs]);
      setRunning(false);
      return;
    }

    const client = createWalletClient({
      chain,
      transport: http(rpc),
    });

    const timer = setInterval(async () => {
      for (const account of accounts) {
        try {
          const hash = await client.sendTransaction({
            account,
            to: toAddress,
            value: 0n,
            data: stringToHex(inscription),
          });
          setLogs((logs) => [
            handleLog(`${handleAddress(account.address)} ${hash}`, "success"),
            ...logs,
          ]);
        } catch (error) {
          setLogs((logs) => [
            handleLog(`${handleAddress(account.address)} error`, "error"),
            ...logs,
          ]);
        }
      }
    }, intervalTime);
    setTimer(timer);
  }, [accounts, chain, inscription, intervalTime, rpc, toAddress]);

  return (
    <main className=" flex flex-col items-center gap-5 py-5">
      <h1 className=" text-5xl">Inscription - DRC-20 GROUP</h1>

      <div className=" flex items-center gap-2">
        <span>Tham gia nhóm:</span>
        <Link
          className=" text-blue-500 hover:underline"
          href="https://t.me/drc20vn"
          target="_blank"
        >
          DRC-20 Viet Nam
        </Link>
      </div>

      <div className=" flex items-center justify-center gap-5">
        <span>Chain (Chọn chain muốn khắc chữ, KHÔNG CHỌN SAI):</span>
        <select
          className=" h-10 w-[200px] rounded-lg border px-2"
          disabled={running}
          onChange={(e) => {
            const text = e.target.value as ChainKey;
            setChain(chains[text]);
          }}
        >
          {Object.keys(chains).map((key) => (
            <option
              key={key}
              value={key}
            >
              {key}
            </option>
          ))}
        </select>
      </div>

      <div className=" flex flex-col gap-2">
        <span>Khóa riêng (bắt buộc, một khóa trên mỗi dòng):</span>
        <textarea
          className=" h-[100px] w-[800px] rounded-lg border p-2"
          placeholder="Khóa riêng (Không có 0x ở đầu)"
          disabled={running}
          onChange={(e) => {
            const text = e.target.value;
            const lines = text.split("\n");
            const accounts = lines.map((line) => {
              const key = "0x" + line.trim();
              if (/^0x[a-fA-F0-9]{64}$/.test(key)) {
                return privateKeyToAccount(key as Hex);
              }
            });
            setAccounts(accounts.filter((x) => x) as PrivateKeyAccount[]);
          }}
        />
      </div>

      <div className=" flex flex-col gap-2">
        <span>Địa chỉ nhận token (bắt buộc):</span>
        <input
          className=" h-10 w-[800px] rounded-lg border px-2"
          placeholder="Địa chỉ nhận token"
          disabled={running}
          onChange={(e) => {
            const text = e.target.value;
            isAddress(text) && setToAddress(text);
          }}
        />
      </div>

      <div className=" flex flex-col gap-2">
        <span>RPC (tùy chọn, công khai mặc định, http, tốt nhất nên sử dụng cái của riêng bạn):</span>
        <input
          className=" h-10 w-[800px] rounded-lg border px-2"
          placeholder="rpc"
          disabled={running}
          onChange={(e) => {
            const text = e.target.value;
            setRpc(text);
          }}
        />
      </div>

      <div className=" flex flex-col gap-2">
        <span>Dòng chữ cần gõ (chữ gốc, không phải dạng hex được chuyển mã):</span>
        <textarea
          className=" h-[100px] w-[800px] rounded-lg border p-2"
          placeholder={`Đừng nhập sai dòng chữ, hãy tự kiểm tra. Ví dụ：\n${example}`}
          disabled={running}
          onChange={(e) => {
            const text = e.target.value;
            setInscription(text.trim());
          }}
        />
      </div>

      <div className=" flex items-center justify-center gap-5">
        <button
          className={classNames(
            " h-10 w-[200px] rounded-full text-white transition-all hover:opacity-80",
            running ? " bg-red-600" : " bg-green-600",
          )}
          onClick={() => {
            if (!running) {
              setRunning(true);
              run();
            } else {
              setRunning(false);
              timer && clearInterval(timer);
            }
          }}
        >
          {running ? "Đang chạy" : "Chạy"}
        </button>

        <input
          className=" h-10 w-[400px] rounded-lg border px-2"
          placeholder="khoảng thời gian (mặc định 1000ms）"
          type="number"
          disabled={running}
          onChange={(e) => {
            const text = e.target.value;
            setIntervalTime(Number(text));
          }}
        />
      </div>

      <div className=" mt-5 flex w-[1000px] flex-col gap-2">
        <span>{`nhật ký (đếm = ${
          logs.filter((log) => log.includes("✅")).length
        }）:`}</span>
        <div className=" flex h-[600px] flex-col gap-1 overflow-auto rounded-lg bg-gray-100 px-4 py-2">
          {logs.map((log, index) => (
            <div
              key={log + index}
              className=" flex h-8 items-center"
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
