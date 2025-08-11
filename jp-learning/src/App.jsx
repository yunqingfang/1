import React, { useState, useEffect, useRef } from "react";

const API_KEY = "AIzaSyAkY5OzhKZzLMmv70WQnxQq45znYXuSgs4"; // ★替换

// 内置基础词库（示例 N5）
const baseWordList = [
  { jp: "こんにちは", romaji: "konnichiwa", zh: "你好" },
  { jp: "ありがとう", romaji: "arigatou", zh: "谢谢" },
  { jp: "さようなら", romaji: "sayounara", zh: "再见" },
  { jp: "水", romaji: "mizu", zh: "水" },
  { jp: "食べる", romaji: "taberu", zh: "吃" },
  { jp: "行く", romaji: "iku", zh: "去" },
  { jp: "見る", romaji: "miru", zh: "看" },
];

export default function App() {
  const [tab, setTab] = useState("search"); // search / words / review / plan / listen
  const [query, setQuery] = useState("日语学习");
  const [videos, setVideos] = useState([]);
  const [words, setWords] = useState(() => {
    const saved = localStorage.getItem("jp_words");
    return saved ? JSON.parse(saved) : baseWordList;
  });
  const [newWord, setNewWord] = useState({ jp: "", romaji: "", zh: "" });

  const [reviewIndex, setReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [learnStatus, setLearnStatus] = useState(() => {
    const saved = localStorage.getItem("jp_learnStatus");
    return saved ? JSON.parse(saved) : {};
  });

  const [dailyGoal, setDailyGoal] = useState(() => {
    return parseInt(localStorage.getItem("jp_dailyGoal")) || 5;
  });
  const [dailyCount, setDailyCount] = useState(() => {
    return parseInt(localStorage.getItem("jp_dailyCount")) || 0;
  });

  useEffect(() => {
    localStorage.setItem("jp_words", JSON.stringify(words));
  }, [words]);

  useEffect(() => {
    localStorage.setItem("jp_learnStatus", JSON.stringify(learnStatus));
  }, [learnStatus]);

  useEffect(() => {
    localStorage.setItem("jp_dailyGoal", dailyGoal);
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem("jp_dailyCount", dailyCount);
  }, [dailyCount]);

  async function searchVideos() {
    if (!query.trim()) return;
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&type=video&maxResults=9&key=${API_KEY}`
      );
      const data = await res.json();
      setVideos(data.items || []);
    } catch (err) {
      console.error(err);
      alert("搜索失败，请检查 API Key 或网络。"); 
    }
  }

  function addWord() {
    if (!newWord.jp.trim()) return alert("日语不能为空");
    setWords((s) => [...s, newWord]);
    setNewWord({ jp: "", romaji: "", zh: "" });
  }

  function markLearned() {
    const word = words[reviewIndex];
    setLearnStatus((s) => ({ ...s, [word.jp]: "learned" }));
    setDailyCount((c) => c + 1);
    nextWord();
  }

  function markLearning() {
    const word = words[reviewIndex];
    setLearnStatus((s) => ({ ...s, [word.jp]: "learning" }));
    nextWord();
  }

  function nextWord() {
    setShowAnswer(false);
    setReviewIndex((i) => (i + 1) % words.length);
  }

  const audioRef = useRef(null);
  const playSampleAudio = () => {
    if (audioRef.current) audioRef.current.play();
  };

  function updateDailyGoal(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      setDailyGoal(val);
    }
  }

  // small helper: export/import word list as JSON
  function exportWords() {
    const dataStr = JSON.stringify(words, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jp-words.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  function importWords(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (Array.isArray(parsed)) setWords(parsed);
        else alert('导入文件格式不正确 (需要 JSON 数组)');
      } catch (err) {
        alert('解析文件失败');
      }
    };
    reader.readAsText(f);
    e.target.value = '';
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">日语学习一体化平台</h1>

      <nav className="mb-6 flex justify-center gap-4 flex-wrap">
        {['search', 'words', 'review', 'plan', 'listen'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${tab===t? 'bg-blue-600 text-white' : 'bg-white'} shadow`}
          >
            {{search:'搜索视频', words:'单词库', review:'背单词', plan:'学习计划', listen:'听力训练'}[t]}
          </button>
        ))}
      </nav>

      {tab==='search' && (
        <section>
          <div className="flex gap-2 mb-4">
            <input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              onKeyDown={(e)=>{if(e.key==='Enter') searchVideos();}}
              className="flex-1 p-2 border rounded" placeholder="搜索视频或关键字 (例如：JLPT N5 语法)"
            />
            <button onClick={searchVideos} className="bg-blue-600 text-white px-4 rounded">搜索</button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {videos.length===0 && <div className="text-gray-600">暂无结果，输入关键词搜索。</div>}
            {videos.map(v=> (
              <a key={v.id.videoId} href={`https://www.youtube.com/watch?v=${v.id.videoId}`} target="_blank" rel="noreferrer" className="bg-white rounded shadow p-3 hover:shadow-lg transition">
                <img src={v.snippet.thumbnails.medium.url} alt={v.snippet.title} className="mb-2 rounded"/>
                <div className="font-semibold text-sm">{v.snippet.title}</div>
                <div className="text-xs text-gray-500">{v.snippet.channelTitle}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {tab==='words' && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">单词库管理</h2>
            <div className="flex gap-2">
              <button onClick={exportWords} className="px-3 py-1 border rounded">导出词库</button>
              <label className="px-3 py-1 border rounded bg-white cursor-pointer">
                导入词库
                <input type="file" accept="application/json" onChange={importWords} className="hidden" />
              </label>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
            <input className="p-2 border rounded" placeholder="日语" value={newWord.jp} onChange={(e)=>setNewWord({...newWord, jp:e.target.value})}/>
            <input className="p-2 border rounded" placeholder="罗马音" value={newWord.romaji} onChange={(e)=>setNewWord({...newWord, romaji:e.target.value})}/>
            <input className="p-2 border rounded" placeholder="中文" value={newWord.zh} onChange={(e)=>setNewWord({...newWord, zh:e.target.value})}/>
            <button onClick={addWord} className="bg-green-600 text-white rounded px-4">添加</button>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {words.map((w,i)=> (
              <div key={i} className="bg-white p-3 rounded shadow flex flex-col">
                <div className="text-lg font-bold">{w.jp}</div>
                <div className="text-sm text-gray-600">{w.romaji}</div>
                <div className="mt-1">{w.zh}</div>
                <div className="mt-auto text-xs font-semibold pt-2">状态：{learnStatus[w.jp]|| '未学习'}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab==='review' && (
        <section className="max-w-xl mx-auto bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-4">单词复习</h2>
          {words.length===0 ? <p>请先添加或导入词库</p> : (
            <>
              <div className="text-4xl font-bold mb-2">{words[reviewIndex].jp}</div>
              <button className="mb-4 text-blue-600 underline" onClick={()=>setShowAnswer(!showAnswer)}>{showAnswer? '隐藏答案' : '显示答案'}</button>
              {showAnswer && (<div className="mb-4"><div>罗马音: {words[reviewIndex].romaji}</div><div>中文: {words[reviewIndex].zh}</div></div>)}
              <div className="flex justify-center gap-4">
                <button onClick={markLearned} className="bg-green-600 text-white px-4 py-2 rounded">我会了</button>
                <button onClick={markLearning} className="bg-yellow-500 text-white px-4 py-2 rounded">还要练</button>
                <button onClick={nextWord} className="px-4 py-2 border rounded">跳过</button>
              </div>
              <div className="mt-4 text-gray-600">今日完成：{dailyCount} / {dailyGoal}</div>
            </>
          )}
        </section>
      )}

      {tab==='plan' && (
        <section className="max-w-xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">学习计划</h2>
          <label className="block mb-2">每日目标单词数：</label>
          <input type="number" min="1" value={dailyGoal} onChange={updateDailyGoal} className="p-2 border rounded w-full mb-4"/>
          <p>今日已学：<strong>{dailyCount}</strong></p>
          <div className="mt-4 text-sm text-gray-600">提示：每日完成目标可保持学习习惯，页面会把完成数保存在浏览器。</div>
        </section>
      )}

      {tab==='listen' && (
        <section className="max-w-xl mx-auto bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-4">听力训练（示例）</h2>
          <p className="mb-4">点击播放示例音频或替换成你自己的音频 URL</p>
          <button onClick={playSampleAudio} className="bg-blue-600 text-white px-6 py-2 rounded mb-4">播放音频</button>
          <audio ref={audioRef} src="https://upload.wikimedia.org/wikipedia/commons/6/60/Japanese_-_Basic_Phrases.ogg" />
        </section>
      )}
    </div>
  );
}
