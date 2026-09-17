"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

type Rows = {
  Id: number;
  Link: string;
  Email: string;
  Password: string;
};

const Page = () => {
  const [val, setval] = useState<Rows[]>([]);
  const [form, setForm] = useState(false);
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [generatepassword, setGP] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [linkToDelete, setLinkToDelete] = useState<number | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [global, setGlobal] = useState<Rows[]>([]);
  const [passwordLen, setPw] = useState<number>(12);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [num, setNum] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    link: "",
    email: "",
    password: "",
  });

  // ── Data fetching ──
  const fetchdata = async () => {
    try {
      const data = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}`, {
        headers: { "content-Type": "application/json" },
      });
      const row = data.data.data;
      console.log(row);
      return row;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.log("Exact Backend Error:", err.response.data);
        } else {
          console.log("Network Error:", err.message);
        }
      } else {
        console.log("Unexpected Error:", err);
      }
    }
  };

  // ── Edit handlers ──
  const handleEditClick = (record: Rows) => {
    setEditingId(record.Id);
    setEditFormData({
      link: record.Link,
      email: record.Email,
      password: record.Password,
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleUpdate = async (id: number) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/update`,
        {
          id: id,
          link: editFormData.link,
          email: editFormData.email,
          password: editFormData.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      fetchdata().then((data) => {
        setval(data);
        setGlobal(data);
      });

      setEditingId(null);
      setErrorMessage(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.log("Exact Backend Error:", err.response.data);
          alert(`Failed to save: ${JSON.stringify(err.response.data)}`);
          setErrorMessage(err.response.data.message);
          console.log(errorMessage);
        } else {
          console.log("Network Error:", err.message);
        }
      } else {
        console.log("Unexpected Error:", err);
      }
    }
  };

  // ── Initial data load ──
  useEffect(() => {
    fetchdata().then((data) => {
      if (data) {
        setval(data);
        setGlobal(data);
        console.log(data);
      }
      const params = new URLSearchParams(window.location.search);
      setOrderBy(params.get("orderBy"));
      setSortBy(params.get("sortBy"));
    });
  }, []);

  // ── Password generator ──
  const generateStrongPassword = () => {
    let chars = "";
    if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (num) chars += "0123456789";
    if (symbols) chars += "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    if (!chars) return "";
    let pass = "";
    for (let i = 0; i < passwordLen; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    return pass;
  };

  // ── Save handler ──
  const handleSave = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/add`,
        { link, email, password },
        { headers: { "Content-Type": "application/json" } },
      );
      fetchdata().then((data) => {
        setval(data);
      });
      setForm(false);
      setErrorMessage(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.log("Exact Backend Error:", err.response.data);
          setErrorMessage(err.response.data.message);
        } else {
          console.log("Network Error:", err.message);
        }
      } else {
        console.log("Unexpected Error:", err);
      }
    }
  };

  // ── Delete handler ──
  const handleDelete = async () => {
    if (!linkToDelete) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/del`, {
        data: { id: linkToDelete },
        headers: { "Content-Type": "application/json" },
      });
      setLinkToDelete(null);
      fetchdata().then((data) => {
        if (data) setval(data);
      });
    } catch (err) {
      console.log(err);
    }
  };

  // ── Copy handler ──
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatepassword);
      alert("Successfully copied!");
    } catch (err) {
      console.error("copy failed", err);
    }
  };

  // ── Sort handler ──
  const handleSort = (field: string) => {
    const params = new URLSearchParams(window.location.search);
    const currentField = params.get("sortBy");
    const currentOrder = params.get("orderBy");
    let order = "asc";
    if (currentField === field) {
      order = currentOrder === "asc" ? "desc" : "asc";
    }
    params.set("sortBy", field);
    params.set("orderBy", order);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  // ── Sorted data fetching ──
  useEffect(() => {
    if (!orderBy || !sortBy) return;
    const fetchSortedData = async () => {
      try {
        const data = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/${sortBy}/${orderBy}`,
        );
        setval(data.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.log("Exact Backend Error:", err.response.data);
            alert(`Failed to save: ${JSON.stringify(err.response.data)}`);
            setErrorMessage(err.response.data.message);
            console.log(errorMessage);
          } else {
            console.log("Network Error:", err.message);
          }
        } else {
          console.log("Unexpected Error:", err);
        }
      }
    };
    fetchSortedData();
  }, [sortBy, orderBy]);

  // ── Search debounce ──
  useEffect(() => {
    if (!search) return;
    const timeoutId = setTimeout(() => {
      let data = [...global];
      data = data.filter((a) => {
        return (
          a.Email.includes(search) ||
          a.Link.includes(search) ||
          a.Password.includes(search)
        );
      });
      setval(data);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  // ── Regenerate password when options change ──
  useEffect(() => {
    const newPassword = generateStrongPassword();
    setGP(newPassword);
  }, [passwordLen, uppercase, lowercase, num, symbols]);

  // ── Sort arrow helper ──
  const SortArrow = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return (
      <Image
        src={orderBy === "asc" ? "/upArrow.svg" : "/downArrow.svg"}
        alt={orderBy === "asc" ? "ascending" : "descending"}
        width={14}
        height={14}
        className="inline-block ml-1 opacity-70"
      />
    );
  };

  // ── Checkbox toggle helper ──
  const CheckToggle = ({
    checked,
    onToggle,
    label,
    id,
  }: {
    checked: boolean;
    onToggle: () => void;
    label: string;
    id: string;
  }) => (
    <div
      className="flex flex-row items-center gap-3 cursor-pointer group select-none"
      onClick={onToggle}
    >
      <div
        id={id}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? "bg-blue-600 border-blue-600 shadow-sm shadow-blue-600/30"
            : "bg-white border-blue-300 group-hover:border-blue-400"
        }`}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <label
        htmlFor={id}
        className="cursor-pointer text-blue-700 font-semibold select-none group-hover:text-blue-600 transition-colors text-sm"
      >
        {label}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50/30 to-blue-50 flex flex-col items-center py-8 md:py-12 text-blue-800">
      <div className="w-full flex flex-col items-center gap-10 px-4 sm:px-6 md:px-8 max-w-6xl">

        {/* ════════════════ PASSWORD GENERATOR CARD ════════════════ */}
        <div className="flex flex-col bg-white rounded-2xl shadow-lg shadow-blue-100/60 border border-blue-100 p-6 md:p-8 w-full relative gap-6">

          {/* Header */}
          <div className="w-full flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-3xl md:text-4xl tracking-tight">
                Password Generator
              </h1>
            </div>
            <p className="text-blue-400 text-sm font-medium">
              Create a secure, random password instantly
            </p>
          </div>

          {/* Generated password display */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-200/70 w-full gap-4">
            <div className="w-full text-center sm:text-left text-xl md:text-2xl font-semibold text-blue-800 bg-transparent outline-none border-none min-w-0 font-mono tracking-tight break-all overflow-hidden leading-relaxed">
              {generatepassword}
            </div>

            <div className="flex flex-row items-center gap-2 shrink-0">
              {/* Retry Button */}
              <button
                className="w-10 h-10 text-blue-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center border border-transparent hover:border-blue-200 active:scale-95"
                title="Regenerate password"
                onClick={() => setGP(generateStrongPassword())}
              >
                <Image src="/retry.svg" alt="retry" width={18} height={18} />
              </button>

              {/* Copy Button */}
              <button
                className="w-10 h-10 text-blue-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center border border-transparent hover:border-blue-200 active:scale-95"
                title="Copy password"
                onClick={handleCopy}
              >
                <Image src="/copy.svg" alt="copy" width={18} height={18} />
              </button>
            </div>
          </div>

          {/* Password settings */}
          <div className="flex flex-col gap-5 bg-blue-50/60 border border-blue-100 p-5 w-full rounded-xl">
            {/* Length slider */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <label
                htmlFor="PasswordLength"
                className="font-semibold text-blue-700 text-sm whitespace-nowrap"
              >
                Password Length:{" "}
                <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md text-sm font-bold">
                  {passwordLen}
                </span>
              </label>
              <input
                type="range"
                id="PasswordLength"
                name="Password Length"
                min="0"
                max="50"
                step="5"
                value={passwordLen}
                onChange={(e) => setPw(Number(e.target.value))}
                className="w-full sm:flex-1 sm:max-w-sm h-2 rounded-full cursor-pointer"
              />
            </div>

            {/* Character type toggles */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="font-bold text-blue-700 text-sm whitespace-nowrap">
                Characters Used
              </h3>
              <div className="flex w-full sm:w-auto flex-row flex-wrap justify-start gap-5 sm:gap-6 bg-white p-3 px-4 rounded-lg border border-blue-100 shadow-sm">
                <CheckToggle
                  checked={uppercase}
                  onToggle={() => setUppercase(!uppercase)}
                  label="ABC"
                  id="uppercase"
                />
                <CheckToggle
                  checked={lowercase}
                  onToggle={() => setLowercase(!lowercase)}
                  label="abc"
                  id="lowercase"
                />
                <CheckToggle
                  checked={num}
                  onToggle={() => setNum(!num)}
                  label="123"
                  id="number"
                />
                <CheckToggle
                  checked={symbols}
                  onToggle={() => setSymbols(!symbols)}
                  label="#$&"
                  id="symbols"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════ VAULT RECORDS CARD ════════════════ */}
        <div className="flex flex-col w-full items-center bg-white rounded-2xl shadow-lg shadow-blue-100/60 border border-blue-100 p-6 md:p-8 gap-6 relative">

          {/* Header */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              </div>
              <h1 className="font-extrabold text-2xl md:text-3xl text-blue-800 tracking-tight">
                Vault Records
              </h1>
            </div>

            <div className="flex flex-row w-full sm:w-auto items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:w-72">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Image src="/search.svg" alt="search" width={16} height={16} className="opacity-40" />
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search records..."
                  className="w-full text-sm border border-blue-200 rounded-lg pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all bg-blue-50/50 focus:bg-white placeholder-blue-300 font-medium"
                />
              </div>

              {/* Add button */}
              <button
                className="flex items-center justify-center rounded-lg h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shrink-0"
                onClick={() => setForm(true)}
                aria-label="Add new record"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full bg-white rounded-xl border border-blue-100 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50/30 border-b border-blue-100">
                <tr>
                  <th className="px-5 py-4 w-16 text-xs font-bold text-blue-400 uppercase tracking-wider text-center">
                    #
                  </th>
                  <th
                    className="px-5 py-4 text-xs font-bold cursor-pointer text-blue-400 uppercase tracking-wider hover:text-blue-600 transition-colors select-none"
                    onClick={() => {
                      if (sortBy !== "link") { setSortBy("link"); setOrderBy("asc"); }
                      else { setOrderBy(orderBy === "asc" ? "desc" : "asc"); }
                    }}
                  >
                    <span className="flex items-center gap-1">
                      Link <SortArrow field="link" />
                    </span>
                  </th>
                  <th
                    className="px-5 py-4 text-xs font-bold cursor-pointer text-blue-400 uppercase tracking-wider hover:text-blue-600 transition-colors select-none"
                    onClick={() => {
                      if (sortBy !== "email") { setSortBy("email"); setOrderBy("asc"); }
                      else { setOrderBy(orderBy === "asc" ? "desc" : "asc"); }
                    }}
                  >
                    <span className="flex items-center gap-1">
                      Email <SortArrow field="email" />
                    </span>
                  </th>
                  <th
                    className="px-5 py-4 text-xs font-bold cursor-pointer text-blue-400 uppercase tracking-wider hover:text-blue-600 transition-colors select-none"
                    onClick={() => {
                      if (sortBy !== "password") { setSortBy("password"); setOrderBy("asc"); }
                      else { setOrderBy(orderBy === "asc" ? "desc" : "asc"); }
                    }}
                  >
                    <span className="flex items-center gap-1">
                      Password <SortArrow field="password" />
                    </span>
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-blue-400 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {val.map((row, index) => (
                  <tr
                    key={row.Id}
                    className="hover:bg-blue-50/40 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-3.5 text-xs text-blue-400 text-center font-bold tabular-nums">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium">
                      {editingId === row.Id ? (
                        <input
                          type="text"
                          name="link"
                          value={editFormData.link}
                          onChange={handleFormChange}
                          onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(row.Id); }}
                          className="w-full px-3 py-1.5 text-sm text-blue-700 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-blue-50/50"
                        />
                      ) : (
                        <Link
                          href={row.Link}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[220px] transition-colors"
                        >
                          {row.Link}
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-blue-700 font-medium">
                      {editingId === row.Id ? (
                        <input
                          type="text"
                          name="email"
                          value={editFormData.email}
                          onChange={handleFormChange}
                          onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(row.Id); }}
                          className="w-full px-3 py-1.5 text-sm text-blue-700 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-blue-50/50"
                        />
                      ) : (
                        <div className="truncate max-w-[220px]">{row.Email}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-blue-600 font-mono tracking-tight">
                      {editingId === row.Id ? (
                        <input
                          type="text"
                          name="password"
                          value={editFormData.password}
                          onChange={handleFormChange}
                          onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(row.Id); }}
                          className="w-full px-3 py-1.5 text-sm text-blue-700 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-blue-50/50 font-mono"
                        />
                      ) : (
                        <span className="bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 text-xs font-mono group-hover:bg-white transition-colors">
                          {row.Password}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {editingId === row.Id ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleUpdate(row.Id)}
                              title="Save"
                              className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white rounded-md px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setErrorMessage(null); }}
                              className="bg-white cursor-pointer hover:bg-red-50 text-red-500 border border-red-200 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                          {editingId === row.Id && errorMessage && errorMessage.length > 0 && (
                            <div className="text-xs text-red-500 text-center font-medium mt-0.5">
                              {errorMessage}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center justify-center">
                          <button
                            onClick={() => handleEditClick(row)}
                            title="Edit"
                            className="w-8 h-8 cursor-pointer flex items-center justify-center bg-white hover:bg-blue-50 text-blue-500 border border-blue-200 hover:border-blue-300 rounded-lg transition-all opacity-60 group-hover:opacity-100"
                          >
                            <Image src="/edit.svg" alt="edit" width={16} height={16} />
                          </button>
                          <button
                            onClick={() => setLinkToDelete(row.Id)}
                            title="Delete"
                            className="w-8 h-8 cursor-pointer flex items-center justify-center bg-white hover:bg-red-50 text-red-400 border border-red-200 hover:border-red-300 rounded-lg transition-all opacity-60 group-hover:opacity-100"
                          >
                            <Image src="/delete.svg" alt="delete" width={16} height={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty state */}
            {val.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-blue-300">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                </svg>
                <p className="text-sm font-medium">No records yet</p>
                <p className="text-xs mt-1 text-blue-200">Click + to add your first password</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════ DELETE CONFIRMATION MODAL ════════════════ */}
      {linkToDelete !== null && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 px-4 animate-fade-in"
          onClick={() => setLinkToDelete(null)}
          onKeyDown={(e) => { if (e.key === "Enter") handleDelete(); }}
        >
          <div
            className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col items-center text-center border border-blue-100 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-blue-900 mb-1.5">Delete Record?</h3>
            <p className="text-blue-500 mb-6 text-sm">
              This action cannot be undone.
            </p>

            <div className="flex flex-row w-full justify-center items-center gap-3">
              <button
                onClick={() => setLinkToDelete(null)}
                className="flex-1 cursor-pointer bg-white border border-blue-200 hover:bg-blue-50 text-sm hover:border-blue-300 text-blue-700 rounded-lg px-5 py-2.5 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 cursor-pointer hover:bg-red-600 text-sm text-white rounded-lg px-5 py-2.5 font-semibold shadow-md shadow-red-500/25 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ ADD RECORD MODAL ════════════════ */}
      {form && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/20 flex justify-center items-center z-50 px-4 animate-fade-in"
          onClick={() => { setForm(false); setErrorMessage(null); }}
        >
          <div
            className="flex w-full max-w-md flex-col bg-white border border-blue-100 shadow-2xl p-7 md:p-8 rounded-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center tracking-tight">
              Add New Record
            </h2>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-blue-500 uppercase tracking-wider pl-0.5">
                  Link
                </label>
                <input
                  className="w-full border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none py-2.5 px-3.5 text-sm text-blue-800 bg-blue-50/50 focus:bg-white rounded-lg transition-all font-medium"
                  id="Link"
                  placeholder="https://example.com/login"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-blue-500 uppercase tracking-wider pl-0.5">
                  Email
                </label>
                <input
                  className="w-full border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none py-2.5 px-3.5 text-sm text-blue-800 bg-blue-50/50 focus:bg-white rounded-lg transition-all font-medium"
                  id="Email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-blue-500 uppercase tracking-wider pl-0.5">
                  Password
                </label>
                <input
                  className="w-full border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none py-2.5 px-3.5 text-sm text-blue-800 bg-blue-50/50 focus:bg-white rounded-lg transition-all font-medium font-mono"
                  id="Password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => {
                    setGP(generateStrongPassword());
                    setPassword(generatepassword);
                    setShowSuggest(true);
                  }}
                />

                {showSuggest && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-blue-200 shadow-xl rounded-xl p-4 z-20 animate-slide-up">
                    <p className="text-xs text-blue-500 mb-4 leading-relaxed">
                      <span className="font-bold text-blue-700 block mb-0.5 text-sm">
                        Strong password generated
                      </span>
                      Contains the character types selected in your generator settings.
                    </p>

                    <div className="flex flex-row justify-end gap-2">
                      <button
                        onClick={(e) => { e.preventDefault(); setShowSuggest(false); }}
                        className="px-4 py-2 text-xs font-bold text-blue-600 cursor-pointer bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Choose own
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); setShowSuggest(false); }}
                        className="px-4 py-2 text-xs font-bold text-white cursor-pointer bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
                      >
                        Use password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="py-2 mt-3 font-medium text-sm text-red-500 bg-red-50 rounded-lg px-3 border border-red-100">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-row justify-end mt-6 gap-3">
              <button
                className="cursor-pointer bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
                onClick={() => { setForm(false); setErrorMessage(null); }}
              >
                Cancel
              </button>
              <button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white cursor-pointer rounded-lg px-5 py-2.5 text-sm font-semibold shadow-md shadow-blue-500/25 transition-all"
                autoFocus
                onClick={() => {
                  handleSave();
                  setEmail("");
                  setPassword("");
                  setLink("");
                }}
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
