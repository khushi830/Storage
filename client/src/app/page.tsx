"use client";

// import { useState } from "react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type Rows = {
  Id: number;
  Link: string;
  Email: string;
  Password: string;
};

const fetchdata = async () => {
  try {
    // e.preventDefault();
    const data = await axios.get("http://localhost:5000/", {
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
  useEffect(() => {
    fetchdata().then((data) => {
      setval(data);
    });
  }, []);

  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);

  
  const generateStrongPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 14; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
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

      setForm(false);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    if (!linkToDelete) return; // Failsafe

    try {
      await axios.delete("http://localhost:5000/del", {
        data: { link: linkToDelete },
        headers: {
          "Content-Type": "application/json",
        },
      });

      setLinkToDelete(null); // Close the box
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center pt-12 px-4 font-sans">
      {!form && (
        <div className="flex flex-col w-full max-w-6xl relative">
          <div className="w-full text-center pb-8">
            <h1 className="font-bold text-3xl text-gray-800">Records</h1>
          </div>

          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full table-fixed text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-20 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {val.map((row, index) => (
                  <tr
                    key={row.Id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={row.Link}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[250px]"
                      >
                        {row.Link}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 truncate max-w-[200px]">
                      {row.Email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-mono tracking-tight">
                      {row.Password}
                    </td>
                    <td className="px-6 py-4 text-center min-w-[150px]">
                      {linkToDelete === row.Link ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-xs font-bold text-red-600">
                            Are you Sure?
                          </span>
                          <div className="flex flex-row items-center justify-center gap-2">
                            <button
                              onClick={handleDelete}
                              className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1 text-xs font-medium transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setLinkToDelete(null)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded px-3 py-1 text-xs font-medium transition-colors"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setLinkToDelete(row.Link)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-md px-3 py-1 text-xs font-medium transition-colors"
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

          
          <div className="fixed bottom-10 right-10">
            <button
              className="flex items-center justify-center rounded-full h-14 w-14 bg-gray-800 text-white shadow-lg hover:bg-gray-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
              onClick={() => setForm(true)}
              aria-label="Add new record"
            >
              <span className="text-3xl font-light mb-1">+</span>
            </button>
          </div>
        </div>
      )}

      {form && (
        <div className="flex w-full max-w-md flex-col bg-white border border-gray-100 shadow-xl p-8 rounded-2xl mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Add New Record
          </h2>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-600 pl-1">
                Link
              </label>
              <input
                className="w-full border border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-200 outline-none py-2.5 px-4 text-gray-800 rounded-lg transition-all"
                id="Link"
                placeholder="https://example.com/login"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-600 pl-1">
                Email
              </label>
              <input
                className="w-full border border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-200 outline-none py-2.5 px-4 text-gray-800 rounded-lg transition-all"
                id="Email"
                placeholder="abc@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-medium text-gray-600 pl-1">
                Password
              </label>
              <input
                className="w-full border border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-200 outline-none py-2.5 px-4 text-gray-800 rounded-lg transition-all"
                id="Password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => {
                
                  if (!password) {
                    setPassword(generateStrongPassword());
                    setShowSuggest(true);
                  }
                }}
              />

              
              {showSuggest && (
                <div className="absolute top-full left-0 mt-2 w-[110%] ml-0.5 bg-white border border-gray-200 shadow-2xl rounded-xl p-4 z-20">
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    <span className="font-semibold text-gray-800 block mb-1">
                      Strong password generated
                    </span>
                    This password contains lowercase and uppercase letters,
                    numbers, and special characters.
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Prevent form submission
                        setPassword(""); // Clear the generated password
                        setShowSuggest(false); // Close box
                      }}
                      className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      Choose your own
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowSuggest(false); // Just close the box and keep the password
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors"
                    >
                      Use password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-end mt-8 gap-3">
            <button
              className="flex justify-center items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-6 py-2.5 font-medium transition-colors"
              onClick={() => setForm(false)}
            >
              Cancel
            </button>
            <button
              className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg px-6 py-2.5 font-medium shadow-sm transition-colors"
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
