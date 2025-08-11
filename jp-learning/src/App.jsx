import React, { useState, useEffect } from "react";

const API_KEY = "AIzaSyAkY5OzhKZzLMmv70WQnxQq45znYXuSgs4"; // ★替换

export default function App() {
  const [query, setQuery] = useState("日语学习");
  const [videos, setVideos] = useState([]);
  const [words, setWords] = useState(() => {
    const saved = localStorage.getItem("jp_words");
    return saved ? JSON.parse(saved) : [];
  });
  const [newWord, setNewWord] = useState({ jp: "", romaji: "", zh: "" });

  useEffect(() => {
    localStorage.setItem("jp_words", JSON.stringify(words));
  }, [words]);

  async function searchVideos() {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=8&key=${API_KEY}`
    );
    const data = await res.json();
    setVideos(data.items || []);
  }

  function addWord() {
    if (!newWord.jp) return;
    setWords([...words, newWord]);
    setNewWord({ jp: "", romaji: "", zh: "" });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">日语学习网站</h1>

      <div className="mb-6">
        <div className="flex gap-2 mb-3">
          <input
            className="border px-3 py-2 flex-1"
            placeholder="搜索日语学习视频..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={searchVideos}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            搜索
          </button>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {videos.map((v) => (
            <a
              key={v.id.videoId}
              href={`https://www.youtube.com/watch?v=${v.id.videoId}`}
              target="_blank"
              className="block border rounded p-2 hover:bg-gray-100"
            >
              <img
                src={v.snippet.thumbnails.medium.url}
                alt={v.snippet.title}
                className="mb-2"
              />
              <p className="text-sm font-medium">{v.snippet.title}</p>
            </a>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">单词卡</h2>
        <div className="flex gap-2 mb-3">
          <input
            className="border px-2 py-1"
            placeholder="日语"
            value={newWord.jp}
            onChange={(e) =>
              setNewWord({ ...newWord, jp: e.target.value })
            }
          />
          <input
            className="border px-2 py-1"
            placeholder="罗马音"
            value={newWord.romaji}
            onChange={(e) =>
              setNewWord({ ...newWord, romaji: e.target.value })
            }
          />
          <input
            className="border px-2 py-1"
            placeholder="中文"
            value={newWord.zh}
            onChange={(e) =>
              setNewWord({ ...newWord, zh: e.target.value })
            }
          />
          <button
            onClick={addWord}
            className="bg-green-500 text-white px-3 rounded"
          >
            添加
          </button>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          {words.map((w, i) => (
            <div
              key={i}
              className="border rounded p-3 bg-white shadow-sm"
            >
              <div className="text-lg font-bold">{w.jp}</div>
              <div className="text-sm text-gray-600">{w.romaji}</div>
              <div className="text-sm">{w.zh}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}