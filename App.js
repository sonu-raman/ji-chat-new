import React, { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [view, setView] = useState("home"); // home / profile

const handleLogin = async () => {
  try {
    const res = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(loginData.email);
    } else {
      alert(data.msg);
    }

  } catch (error) {
    console.log(error);
    alert("Login failed");
  }
};

  const fetchPosts = async () => {
    const res = await fetch("http://localhost:8080/posts");
    const data = await res.json();
    setPosts(data);
  };

  const createPost = async () => {
    const formData = new FormData();
    formData.append("user", user);
    formData.append("content", content);
    files.forEach(f => formData.append("images", f));

    await fetch("http://localhost:8080/upload/post", {
      method: "POST",
      body: formData,
    });

    setContent("");
    setFiles([]);
    fetchPosts();
  };

  const likePost = async (id) => {
    await fetch(`http://localhost:8080/posts/${id}/like`, { method: "POST" });
    fetchPosts();
  };

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  // ---------------- LOGIN ----------------
  if (!user) {
    return (
      <div style={center}>
        <h1>Instagram Clone</h1>
        <input placeholder="Email" onChange={e => setLoginData({ ...loginData, email: e.target.value })} />
        <input type="password" placeholder="Password" onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  // ---------------- APP ----------------
  return (
    <div style={{ fontFamily: "Arial" }}>
      
      {/* Navbar */}
      <div style={navbar}>
        <h2>📸 Instagram</h2>
        <div>
          <span style={icon} onClick={() => setView("home")}>🏠</span>
          <span style={icon}>➕</span>
          <span style={icon} onClick={() => setView("profile")}>👤</span>
        </div>
      </div>

      {/* Create Post */}
      {view === "home" && (
        <>
          <div style={postBox}>
            <input
              placeholder="What's on your mind?"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <input type="file" multiple onChange={e => setFiles([...e.target.files])} />
            <button onClick={createPost}>Post</button>
          </div>

          {/* Feed */}
          <div style={{ maxWidth: "500px", margin: "auto" }}>
            {posts.map(post => (
              <PostCard key={post._id} post={post} likePost={likePost} />
            ))}
          </div>
        </>
      )}

      {/* Profile Page */}
      {view === "profile" && (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h2>{user}</h2>
          <p>Your Posts: {posts.filter(p => p.user === user).length}</p>
        </div>
      )}

    </div>
  );
}

// ---------------- POST CARD ----------------
function PostCard({ post, likePost }) {
  const [index, setIndex] = useState(0);

  const next = () => {
    if (post.images && index < post.images.length - 1) {
      setIndex(index + 1);
    }
  };

  const prev = () => {
    if (post.images && index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <div style={card}>
      <b>{post.user}</b>
      <p>{post.content}</p>

      {/* Carousel */}
      {post.images && post.images.length > 0 && (
        <div onDoubleClick={() => likePost(post._id)}>
          <img src={post.images[index]} alt="" style={imgStyle} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={prev}>⬅️</button>
            <button onClick={next}>➡️</button>
          </div>
        </div>
      )}

      <button style={likeBtn} onClick={() => likePost(post._id)}>
        ❤️ {post.likes}
      </button>
    </div>
  );
}

// ---------------- STYLES ----------------
const center = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "100px",
  gap: "10px"
};

const navbar = {
  display: "flex",
  justifyContent: "space-between",
  padding: "15px",
  borderBottom: "1px solid #ddd",
  position: "sticky",
  top: 0,
  background: "white"
};

const icon = {
  fontSize: "20px",
  margin: "0 10px",
  cursor: "pointer"
};

const postBox = {
  padding: "15px",
  borderBottom: "1px solid #ddd",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const card = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "10px",
  margin: "15px 0"
};

const imgStyle = {
  width: "100%",
  borderRadius: "10px",
  marginTop: "10px"
};

const likeBtn = {
  border: "none",
  background: "none",
  cursor: "pointer",
  color: "red",
  fontWeight: "bold"
};

export default App;