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

const fetchdata = async () => {
  try {
    const data = await axios.get("http://localhost:5000", {
      headers: {
        "content-Type": "application/json",
      },
    });
    const row = data.data.data;

    console.log(row);
    return row;
  } catch (err) {
    console.log(err);
  }
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
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [global, setGlobal] = useState<Rows[]>([]);
  const [passwordLen, setPw] = useState<number>(12);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [num, setNum] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchdata().then((data) => {
      if (data) {
        setval(data);
        setGlobal(data);
        console.log(data);
      }

      // Read params directly from the browser instead of useSearchParams()
      const params = new URLSearchParams(window.location.search);
      setOrderBy(params.get("orderBy"));
      setSortBy(params.get("sortBy"));
    });
  }, []);

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

  const handleSave = async () => {
    try {
      await axios.post(
        "http://localhost:5000/add",
        {
          link: link,
          email: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      fetchdata().then((data) => {
        setval(data);
      });
      setForm(false);

      // window.location.reload();
    } catch (err) {
      console.log(err);
      // throw new Error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;

    try {
      await axios.delete("http://localhost:5000/del", {
        data: { link: linkToDelete },
        headers: {
          "Content-Type": "application/json",
        },
      });

      setLinkToDelete(null);

      fetchdata().then((data) => {
        if (data) setval(data);
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    try {
      // Use window.location.search to get current params
      const params = new URLSearchParams(window.location.search);
      const data = [...val];

      if (orderBy === "asc") {
        data.sort((a, b) => a.Email.localeCompare(b.Email));
        params.set("orderBy", "asc");
      } else if (orderBy === "desc") {
        data.sort((a, b) => b.Email.localeCompare(a.Email));
        params.set("orderBy", "desc");
      }

      // Update the URL if we actually have data to sort
      if (data.length > 0) {
        router.replace(`${pathname}?${params.toString()}`);
        setval(data);
      }
    } catch (err) {
      console.log(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, orderBy]);

  useEffect(() => {
    let data = [...global];

    data = data.filter((a) => {
      return (
        a.Email.includes(search) ||
        a.Link.includes(search) ||
        a.Password.includes(search)
      );
    });
    setval(data);
  }, [search]);

  useEffect(() => {
    const newPassword = generateStrongPassword();
    setGP(newPassword);
  }, [passwordLen, uppercase, lowercase, num, symbols]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center py-8 font-sans text-slate-800">
      {!form && (
        <div className="w-full flex flex-col items-center gap-12 px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="flex flex-col bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 md:p-10 w-full max-w-5xl relative gap-8">
            <div className="flex flex-col w-full relative">
              <div className="w-full flex flex-col items-center pb-6 gap-2 text-center">
                <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-4xl md:text-5xl tracking-tight pb-1">
                  Password Generator
                </h1>
                <h2 className="font-medium text-lg text-slate-500">
                  Create a secure, random password instantly
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-200 w-full shadow-inner gap-4">
                {/* Password Input Area */}
                <input
                  type="text"
                  value={generatepassword}
                  className="w-full text-center sm:text-left text-3xl md:text-4xl font-semibold text-slate-800 bg-transparent outline-none border-none min-w-0 font-mono tracking-tight"
                />

                {/* Action Buttons Area */}
                <div className="flex flex-row items-center gap-4 shrink-0">
                  {/* Retry Button */}
                  <button
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm border border-transparent hover:border-slate-200 active:scale-95"
                    title="Regenerate password"
                    onClick={()=>{
                      setGP(generateStrongPassword());
                    }}
                  >
                    <img src="/retry.svg" alt="retry" className="w-6 h-6" />
                  </button>

                  {/* Copy Button */}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 md:px-8 rounded-xl whitespace-nowrap transition-all shadow-lg shadow-blue-600/30 active:scale-95">
                    Copy password
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-col gap-8 bg-slate-50/80 border border-slate-100 p-4  w-full rounded-2xl">
                {/* settings password */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <label
                    htmlFor="Password"
                    className="font-semibold text-slate-700 text-xl md:min-w-[200px]"
                  >
                    Password Length: <span className="text-blue-600">{passwordLen}</span>
                  </label>
                  <input
                    type="range"
                    id="Password"
                    name="Password Length"
                    min="0"
                    max="50"
                    step="5"
                    value={passwordLen}
                    onChange={(e) => setPw(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-full cursor-pointer  accent-blue-600 flex-1 "
                  />
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex flex-row min-w-[200px]">
                    <h3 className="font-bold text-slate-700 text-lg">Characters Used</h3>
                  </div>
                  <div className="flex w-full flex-row flex-wrap justify-start md:justify-between gap-4 md:gap-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-row items-center gap-3 cursor-pointer group">
                      <div
                        id="uppercase"
                        onClick={() => {
                          setUppercase(!uppercase);
                        }}
                        className="transition-transform group-active:scale-90"
                      >
                        {!uppercase && (
                          <img
                            src="/svg.svg"
                            alt="check"
                            className="w-6 h-6 opacity-30 grayscale"
                          />
                        )}
                        {uppercase && (
                          <img
                            src="/check.svg"
                            alt="check"
                            className="w-6 h-6 drop-shadow-sm"
                          />
                        )}
                      </div>
                      <label
                        htmlFor="uppercase"
                        className="cursor-pointer text-slate-700 font-semibold select-none group-hover:text-blue-600 transition-colors"
                      >
                        Uppercase
                      </label>
                    </div>
                    <div className="flex flex-row items-center gap-3 cursor-pointer group">
                      <span
                        id="lowercase"
                        onClick={() => {
                          setLowercase(!lowercase);
                        }}
                        className="transition-transform group-active:scale-90"
                      >
                        {!lowercase && (
                          <img
                            src="/svg.svg"
                            alt="check"
                            className="w-6 h-6 opacity-30 grayscale"
                          />
                        )}
                        {lowercase && (
                          <img
                            src="/check.svg"
                            alt="check"
                            className="w-6 h-6 drop-shadow-sm"
                          />
                        )}
                      </span>
                      <label
                        htmlFor="lowercase"
                        className="cursor-pointer text-slate-700 font-semibold select-none group-hover:text-blue-600 transition-colors"
                      >
                        Lowercase
                      </label>
                    </div>
                    <div className="flex flex-row items-center gap-3 cursor-pointer group">
                      <span
                        id="number"
                        onClick={() => {
                          setNum(!num);
                        }}
                        className="transition-transform group-active:scale-90"
                      >
                        {!num && (
                          <img
                            src="/svg.svg"
                            alt="check"
                            className="w-6 h-6 opacity-30 grayscale"
                          />
                        )}
                        {num && (
                          <img
                            src="/check.svg"
                            alt="check"
                            className="w-6 h-6 drop-shadow-sm"
                          />
                        )}
                      </span>
                      <label
                        htmlFor="number"
                        className="cursor-pointer text-slate-700 font-semibold select-none group-hover:text-blue-600 transition-colors"
                      >
                        Numbers
                      </label>
                    </div>
                    <div className="flex flex-row items-center gap-3 cursor-pointer group">
                      <span
                        id="symbols"
                        onClick={() => {
                          setSymbols(!symbols);
                        }}
                        className="transition-transform group-active:scale-90"
                      >
                        {!symbols && (
                          <img
                            src="/svg.svg"
                            alt="check"
                            className="w-6 h-6 opacity-30 grayscale"
                          />
                        )}
                        {symbols && (
                          <img
                            src="/check.svg"
                            alt="check"
                            className="w-6 h-6 drop-shadow-sm"
                          />
                        )}
                      </span>
                      <label
                        htmlFor="symbols"
                        className="cursor-pointer text-slate-700 font-semibold select-none group-hover:text-blue-600 transition-colors"
                      >
                        Symbols
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full max-w-5xl items-center bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 md:p-10 gap-8 relative">
            <div className="w-full text-center pb-2">
              <h1 className="font-extrabold text-3xl md:text-4xl text-slate-800 tracking-tight">Vault Records</h1>
            </div>
            
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by link, email, or password..."
              className="w-full max-w-2xl text-lg border border-slate-300 rounded-xl px-6 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm bg-slate-50 focus:bg-white placeholder-slate-400 font-medium"
            />

            <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-5 w-20 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                      ID
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Link
                    </th>
                    <th
                      className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors group select-none flex-row items-center gap-1"
                      onClick={() => {
                        if (sortBy !== "email") {
                          setSortBy("email");
                          setOrderBy("asc");
                        } else {
                          if (orderBy === "asc") setOrderBy("desc");
                          else setOrderBy("asc");
                        }
                      }}
                    >
                      Email
                      <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Password
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {val.map((row, index) => (
                    <tr
                      key={row.Id}
                      className="hover:bg-blue-50/40 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 text-sm text-slate-500 text-center font-bold">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <Link
                          href={row.Link}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[200px] transition-colors"
                        >
                          {row.Link}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 truncate max-w-[200px] font-medium">
                        <div>{row.Email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono tracking-tight">
                        <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 group-hover:bg-white transition-colors">{row.Password}</span>
                      </td>
                      <td className="px-6 py-4 text-center min-w-[150px]">
                        {linkToDelete === row.Link ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
                              Are you Sure?
                            </span>
                            <div className="flex flex-row items-center justify-center gap-2">
                              <button
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-1.5 text-xs font-bold transition-colors shadow-sm"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setLinkToDelete(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg px-4 py-1.5 text-xs font-bold transition-colors"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setLinkToDelete(row.Link)}
                            className="bg-white hover:bg-red-50 text-red-500 border border-red-200 hover:border-red-300 rounded-lg px-5 py-2 text-xs font-bold transition-all shadow-sm opacity-80 group-hover:opacity-100"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="absolute bottom-6 right-6 z-10">
              <button
                className="flex items-center justify-center rounded-full h-16 w-16 bg-blue-600 text-white shadow-xl shadow-blue-600/40 hover:bg-blue-700 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                onClick={() => setForm(true)}
                aria-label="Add new record"
              >
                <span className="text-4xl font-light mb-1 leading-none block">+</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {form && (
        <div className="flex w-full max-w-md flex-col bg-white border border-slate-200 shadow-2xl shadow-slate-300/50 p-8 md:p-10 rounded-[2rem] mt-12 transform transition-all">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-8 text-center tracking-tight">
            Add New Record
          </h2>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1">
                Link
              </label>
              <input
                className="w-full border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none py-3 px-4 text-slate-800 bg-slate-50 focus:bg-white rounded-xl transition-all shadow-sm font-medium"
                id="Link"
                placeholder="https://example.com/login"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1">
                Email
              </label>
              <input
                className="w-full border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none py-3 px-4 text-slate-800 bg-slate-50 focus:bg-white rounded-xl transition-all shadow-sm font-medium"
                id="Email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-bold text-slate-700 pl-1">
                Password
              </label>
              <input
                className="w-full border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none py-3 px-4 text-slate-800 bg-slate-50 focus:bg-white rounded-xl transition-all shadow-sm font-medium font-mono"
                id="Password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => {
                  // if (!password) {
                  // let var={generateStrongPassword()};
                  setGP(generateStrongPassword());
                  setPassword(generatepassword);
                  setShowSuggest(true);
                  // }
                }}
              />

              {showSuggest && (
                <div className="absolute top-[110%] left-0 w-full bg-white border border-slate-200 shadow-2xl shadow-slate-200/60 rounded-2xl p-5 z-20 transition-all">
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                    <span className="font-extrabold text-slate-800 block mb-1 text-base">
                      Strong password generated
                    </span>
                    This password contains lowercase and uppercase letters,
                    numbers, and special characters.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // setPassword(generatep/assword);
                        setShowSuggest(false);
                      }}
                      className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Choose your own
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowSuggest(false);
                      }}
                      className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
                    >
                      Use password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-end mt-10 gap-4">
            <button
              className="flex justify-center items-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl px-6 py-3 font-bold transition-all shadow-sm"
              onClick={() => setForm(false)}
            >
              Cancel
            </button>
            <button
              className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl px-6 py-3 font-bold shadow-lg shadow-slate-800/30 transition-all"
              onClick={handleSave}
            >
              Save Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;