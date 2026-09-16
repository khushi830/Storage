"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
// import { useRouter, useSearchParams } from "next/navigation";
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
    if (axios.isAxiosError(err)) {
      // TypeScript now safely knows 'err' is an AxiosError
      if (err.response) {
        console.log("Exact Backend Error:", err.response.data);
        alert(`Failed to save: ${JSON.stringify(err.response.data)}`);
        setErrorMessage(err.response.data.message);
        console.log(errorMessage);
      } else {
        console.log("Network Error:", err.message);
      }
    } else {
      // Handles generic, non-network JavaScript errors
      console.log("Unexpected Error:", err);
    }
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
  const [linkToDelete, setLinkToDelete] = useState<number | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [global, setGlobal] = useState<Rows[]>([]);
  const [passwordLen, setPw] = useState<number>(12);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [num, setNum] = useState(false);
  const [symbols, setSymbols] = useState(false);
  // const[updateErr,setUpdateErr]=useState<string|null>(null);
  const router = useRouter();

  const pathname = usePathname();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    link: "",
    email: "",
    password: "",
  });

  // 1. Triggered when you click the Edit (Pencil) button
  const handleEditClick = (record: Rows) => {
    setEditingId(record.Id);
    // Pre-fill the form state with the existing data
    setEditFormData({
      link: record.Link,
      email: record.Email,
      password: record.Password,
    });
  };

  // 2. Triggered every time you type in any of the edit inputs
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Update the specific field (link, email, or password) dynamically
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // 3. Triggered when you click the Save button
  const handleUpdate = async (id: number) => {
    try {
      // Send the updated data to your backend (adjust the URL/method to match your backend)
      await axios.patch(
        "http://localhost:5000/update",
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
      // console.log("Error updating record:", err);
      if (axios.isAxiosError(err)) {
        // TypeScript now safely knows 'err' is an AxiosError
        if (err.response) {
          console.log("Exact Backend Error:", err.response.data);
          alert(`Failed to save: ${JSON.stringify(err.response.data)}`);
          setErrorMessage(err.response.data.message);
          console.log(errorMessage);
        } else {
          console.log("Network Error:", err.message);
        }
      } else {
        // Handles generic, non-network JavaScript errors
        console.log("Unexpected Error:", err);
      }
    }
  };

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
      setErrorMessage(null);

      // window.location.reload();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // TypeScript now safely knows 'err' is an AxiosError
        if (err.response) {
          console.log("Exact Backend Error:", err.response.data);
          // alert(`Failed to save: ${JSON.stringify(err.response.data)}`);
          setErrorMessage(err.response.data.message);
        } else {
          console.log("Network Error:", err.message);
        }
      } else {
        // Handles generic, non-network JavaScript errors
        console.log("Unexpected Error:", err);
      }
    }
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;

    try {
      await axios.delete("http://localhost:5000/del", {
        data: { id: linkToDelete },
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatepassword);
      alert("sucessfully copied");
    } catch (err) {
      console.error("copy failed", err);
    }
  };

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

    router.replace(`/?${params.toString()}`, {
        scroll: false
    });
};
  useEffect(() => {
    // const fetchdata = async () => {
    //   try {
    //     const data = await axios.get(
    //       "http://localhost:5000/${orderBy}/${sortBy}",
    //       {
    //         headers: {
    //           "content-Type": "application/json",
    //         },
    //       },
    //     );

    //     setval(data.data.data);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // };
    // if (orderBy && sortBy) {
    //   fetchdata();
    // }
    if (!orderBy || !sortBy) return;

    const fetchSortedData = async () => {
      try {
        const data = await axios.get(
          `http://localhost:5000/${sortBy}/${orderBy}`,
        );

        setval(data.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          // TypeScript now safely knows 'err' is an AxiosError
          if (err.response) {
            console.log("Exact Backend Error:", err.response.data);
            alert(`Failed to save: ${JSON.stringify(err.response.data)}`);
            setErrorMessage(err.response.data.message);
            console.log(errorMessage);
          } else {
            console.log("Network Error:", err.message);
          }
        } else {
          // Handles generic, non-network JavaScript errors
          console.log("Unexpected Error:", err);
        }
      }
    };

    fetchSortedData();
  }, [sortBy, orderBy]);

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

  useEffect(() => {
    const newPassword = generateStrongPassword();
    setGP(newPassword);
  }, [passwordLen, uppercase, lowercase, num, symbols]);

  return (
    <div className="min-h-screen w-full bg-blue-50 flex flex-col items-center py-8 font-sans text-blue-800">
      <div className="w-full flex flex-col items-center gap-12 px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="flex flex-col bg-white rounded-3xl shadow-xl shadow-blue-200/50 border border-blue-200 p-6 md:p-10 w-full max-w-5xl relative gap-8">
          <div className="flex flex-col w-full relative">
            <div className="w-full flex flex-col items-center pb-6 gap-2 text-center">
              <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-4xl md:text-5xl tracking-tight pb-1">
                Password Generator
              </h1>
              <h2 className="font-medium text-lg text-blue-500">
                Create a secure, random password instantly
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 bg-blue-50 rounded-2xl border border-blue-200 w-full shadow-inner gap-4">
              <div className="w-full text-center sm:text-left text-3xl md:text-4xl font-semibold text-blue-800 bg-transparent outline-none border-none min-w-0 font-mono tracking-tight">
                {generatepassword}
              </div>

              {/* Action Buttons Area */}
              <div className="flex flex-row items-center gap-4 shrink-0">
                {/* Retry Button */}
                <button
                  className="p-3  h-full  text-blue-400 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm border border-transparent hover:border-blue-200 active:scale-95"
                  title="Regenerate password"
                  onClick={() => {
                    setGP(generateStrongPassword());
                  }}
                >
                  <Image src="/retry.svg" alt="retry" width="22" height="22" />
                </button>

                {/* Copy Button */}
                <button className="p-3 text-blue-400 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm border border-transparent hover:border-blue-200 active:scale-95">
                  <Image
                    src="/copy.svg"
                    alt="copy"
                    width={22}
                    height={22}
                    className=""
                    onClick={handleCopy}
                  />
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-8 bg-blue-50/80 border border-blue-100 p-4  w-full rounded-2xl">
              {/* settings password */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <label
                  htmlFor="Password"
                  className="font-semibold text-blue-700 text-xl md:min-w-[200px]"
                >
                  Password Length:{" "}
                  <span className="text-blue-600">{passwordLen}</span>
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
                  className="w-full h-2.5 bg-blue-200 rounded-full cursor-pointer  accent-blue-600 flex-1 "
                />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex flex-row min-w-[200px]">
                  <h3 className="font-bold text-blue-700 text-lg">
                    Characters Used
                  </h3>
                </div>
                <div className="flex w-full flex-row flex-wrap justify-start md:justify-between gap-4 md:gap-8 bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
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
                      className="cursor-pointer text-blue-700 font-semibold select-none group-hover:text-blue-600 transition-colors"
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
                      className="cursor-pointer text-blue-700 font-semibold select-none group-hover:text-blue-600 transition-colors"
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
                      className="cursor-pointer text-blue-700 font-semibold select-none group-hover:text-blue-600 transition-colors"
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
                      className="cursor-pointer text-blue-700 font-semibold select-none group-hover:text-blue-600 transition-colors"
                    >
                      Symbols
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-5xl items-center bg-white rounded-3xl shadow-xl shadow-blue-200/50 border border-blue-200 p-6 md:p-10 gap-8 relative">
          <div className="w-full text-center pb-2">
            <h1 className="font-extrabold text-3xl md:text-4xl text-blue-800 tracking-tight">
              Vault Records
            </h1>
          </div>
          <div className="flex flex-row w-full justify-between gap-10 items-center ">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by link, email, or password..."
              className="w-full text-lg border border-blue-300 rounded-xl px-6 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm bg-blue-50 focus:bg-white placeholder-blue-400 font-medium"
            />

            <div className="">
              <button
                className="flex items-center justify-center rounded-full h-14 w-14 bg-blue-600 text-white shadow-xl shadow-blue-600/40 hover:bg-blue-700 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                onClick={() => setForm(true)}
                aria-label="Add new record"
              >
                <span className="text-4xl font-light mb-1 leading-none block">
                  +
                </span>
              </button>
            </div>
          </div>

          <div className="w-full bg-white rounded-2xl shadow-sm border border-blue-200 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-blue-50 border-b border-blue-200">
                <tr>
                  <th className="px-6 py-5 w-20 text-xs font-bold text-blue-500 uppercase tracking-wider text-center">
                    S.no
                  </th>
                  <th
                    className="px-6 py-5 text-xs font-bold cursor-pointer text-blue-500 uppercase tracking-wider"
                    onClick={() => {
                      if (sortBy !== "link") {
                        setSortBy("link");
                        setOrderBy("asc");
                      } else {
                        setOrderBy(orderBy === "asc" ? "desc" : "asc");
                      }
                    }}
                  >
                    Link
                  </th>
                  <th
                    className="px-6 flex flex-row py-5 text-xs    items-center font-bold text-blue-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors group select-none flex-row items-center gap-1"
                    // onClick={() => handleSort("email")}
                    onClick={() => {
                      if (sortBy !== "email") {
                        setSortBy("email");
                        setOrderBy("asc");
                      } else {
                        setOrderBy(orderBy === "asc" ? "desc" : "asc");
                      }
                    }}
                  >
                    Email
                    <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Image
                        src="/downArrow.svg"
                        alt="downArrow"
                        width={12}
                        height={12}
                      />
                    </span>
                  </th>
                  <th
                    className="px-6 py-5 text-xs font-bold cursor-pointer text-blue-500 uppercase tracking-wider"
                    onClick={() => {
                      if (sortBy !== "password") {
                        setSortBy("password");
                        setOrderBy("asc");
                      } else {
                        setOrderBy(orderBy === "asc" ? "desc" : "asc");
                      }
                    }}
                  >
                    Password
                  </th>
                  <th className="px-6 py-5 text-xs font-bold  text-blue-500 uppercase tracking-wider text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {val.map((row, index) => (
                  <React.Fragment key={row.Id}>
                    <tr
                      key={row.Id}
                      className="hover:bg-blue-50/40 transition-colors duration-150 group"
                    >
                      <td className="px-4 py-4 text-sm text-blue-500 text-center font-bold">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {editingId === row.Id ? (
                          <input
                            type="text"
                            name="link"
                            value={editFormData.link}
                            onChange={handleFormChange}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdate(row.Id);
                              }
                            }}
                            className="w-full p-1  text-blue-600 border rounded-lg border-blue-500  outline-blue-300 transition-all"
                          />
                        ) : (
                          <Link
                            href={row.Link}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[200px] transition-colors"
                          >
                            {row.Link}
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-blue-700 truncate max-w-[200px] font-medium">
                        {editingId === row.Id ? (
                          <input
                            type="text"
                            name="email"
                            value={editFormData.email}
                            onChange={handleFormChange}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdate(row.Id);
                              }
                            }}
                            className="w-full p-1 text-blue-600 border rounded-lg border-blue-500 outline-blue-300 transition-all"
                          />
                        ) : (
                          <div>{row.Email}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-blue-600 font-mono tracking-tight">
                        {editingId === row.Id ? (
                          <input
                            type="text"
                            name="password"
                            value={editFormData.password}
                            onChange={handleFormChange}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdate(row.Id);
                              }
                            }}
                            className="w-full p-1 text-blue-600 border rounded-lg  border-blue-500 outline-blue-300 transition-all"
                          />
                        ) : (
                          <span className="bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 group-hover:bg-white transition-colors">
                            {row.Password}
                          </span>
                        )}
                      </td>
                      <td className="px-1 py-4 text-center min-w-[150px]">
                        {editingId === row.Id ? (
                          <div className="flex flex-col ">
                            <div className="flex w-full justify-center gap-2">
                              <button
                                onClick={() => handleUpdate(row.Id)}
                                title="save"
                                className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white rounded-lg px-2 py-1.5 text-xs font-medium transition-colors shadow-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setErrorMessage(null);
                                }}
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white rounded-lg px-2 py-1.5 text-xs font-medium transition-colors shadow-sm"
                              >
                                Cancel
                              </button>
                            </div>
                            <div className="w-full">
                              {editingId === row.Id &&
                                errorMessage &&
                                errorMessage?.length > 0 && (
                                  <div className="text-sm text-red-500 text-center font-light">
                                    {errorMessage}
                                  </div>
                                )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-4 items-center justify-center ">
                            <button
                              onClick={() => handleEditClick(row)}
                              title="Edit"
                              className="bg-white cursor-pointer hover:bg-blue-50 text-blue-500 border border-blue-200 hover:border-blue-300 rounded-lg  p-2 text-xs font-bold transition-all shadow-sm opacity-80 group-hover:opacity-100"
                            >
                              <Image
                                src="/edit.svg"
                                alt="edit"
                                width="12"
                                height="12"
                              />
                            </button>

                            <button
                              onClick={() => setLinkToDelete(row.Id)}
                              className="bg-white cursor-pointer hover:bg-red-50 text-red-500 border border-red-200 hover:border-red-300 rounded-lg  p-2 text-xs font-bold transition-all shadow-sm opacity-80 group-hover:opacity-100"
                            >
                              <Image
                                src="/delete.svg"
                                alt="delete"
                                width="12"
                                height="12"
                              />
                            </button>

                            {linkToDelete !== null && (
                              <div className="flex flex-col h-screen items-center justify-center">
                                <div
                                  className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 px-4"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      // setLinkToDelete(null);
                                      handleDelete();
                                    }
                                  }}
                                >
                                  <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center text-center border border-blue-100 transform transition-all">
                                    {/* <h3 className="text-2xl font-extrabold text-blue-900 mb-2">Delete Record?</h3> */}
                                    <p className="text-blue-800 mb-8 font-medium text-xl">
                                      Are you sure you want to delete this
                                      record?
                                    </p>

                                    <div className="flex flex-row w-full justify-center items-center gap-12">
                                      <button
                                        onClick={() => setLinkToDelete(null)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            setLinkToDelete(null);
                                          }
                                        }}
                                        className="flex cursor-pointer bg-white border-2 border-blue-200 hover:bg-blue-50 text-xl hover:border-blue-300 text-blue-700 rounded-xl px-6 py-3 font-medium transition-all"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleDelete}
                                        className="flex bg-red-500 cursor-pointer hover:bg-red-600 text-xl text-white rounded-xl  px-6 py-3 font-medium shadow-lg shadow-red-500/30 transition-all"
                                      >
                                        Yes
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {form && (
        <div className="flex justify-center items-center absolute w-full  h-screen overflow-hidden backdrop-blur-xl ">
          <div
            className="flex w-full max-w-md flex-col bg-white border border-blue-200 shadow-2xl shadow-blue-300/50 p-8 md:p-10 rounded-[2rem] mt-12 transform transition-all"
            // tabIndex={0}
          >
            <h2 className="text-3xl font-extrabold text-blue-800 mb-8 text-center tracking-tight">
              Add New Record
            </h2>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-blue-700 pl-1">
                  Link
                </label>
                <input
                  className="w-full border border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none py-3 px-4 text-blue-800 bg-blue-50 focus:bg-white rounded-xl transition-all shadow-sm font-medium"
                  id="Link"
                  placeholder="https://example.com/login"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-blue-700 pl-1">
                  Email
                </label>
                <input
                  className="w-full border border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none py-3 px-4 text-blue-800 bg-blue-50 focus:bg-white rounded-xl transition-all shadow-sm font-medium"
                  id="Email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-sm font-bold text-blue-700 pl-1">
                  Password
                </label>
                <input
                  className="w-full border border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none py-3 px-4 text-blue-800 bg-blue-50 focus:bg-white rounded-xl transition-all shadow-sm font-medium font-mono"
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
                  <div className="absolute top-[110%] left-0 w-full bg-white border border-blue-200 shadow-2xl shadow-blue-200/60 rounded-2xl p-5 z-20 transition-all">
                    <p className="text-sm text-blue-600 mb-5 leading-relaxed">
                      <span className="font-extrabold text-blue-800 block mb-1 text-base">
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
                        className="px-5 py-2.5 text-sm font-bold text-blue-700 cursor-pointer bg-blue-100 border border-blue-200 rounded-xl hover:bg-blue-200 transition-colors"
                      >
                        Choose your own
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowSuggest(false);
                        }}
                        className="px-5 py-2.5 text-sm font-bold text-white cursor-pointer bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
                      >
                        Use password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className=" py-2 font-light text-red-500">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-row justify-end mt-10 gap-4 ">
              <button
                className="flex justify-center items-center cursor-pointer bg-white border border-blue-300 hover:bg-blue-50  text-blue-700 rounded-xl px-6 py-3 font-bold transition-all shadow-sm"
                onClick={() => {
                  setForm(false);
                  setErrorMessage(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer rounded-xl px-6 py-3  border-blue-800 font-bold shadow-lg shadow-blue-800/30 transition-al focus:ring-blue-300 border border-transparentl"
                autoFocus
                onClick={() => {
                  handleSave();
                  // setErrorMessage(null);
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
