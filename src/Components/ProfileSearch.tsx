import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  photoURL?: string;
}

export default function ProfileSearch() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim().length < 2) {
        setResults([]);
        return;
      }

      searchUsers(search.toLowerCase());
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [search]);

  const searchUsers = async (value: string) => {
    setLoading(true);

    const q = query(
      collection(db, "users"),
      where("usernameLower", ">=", value),
      where("usernameLower", "<=", value + "\uf8ff"),
      limit(10)
    );

    const snap = await getDocs(q);

    const users: UserProfile[] = snap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<UserProfile, "id">)
    }));

    setResults(users);
    setLoading(false);
  };

  return (
    <div style={container}>
      <input
        style={input}
        placeholder="Buscar perfil por @username"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading && <p style={hint}>Buscando...</p>}

      {results.length > 0 && (
        <div style={resultsBox}>
          {results.map(user => (
            <div
              key={user.id}
              style={resultItem}
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <img
                src={user.photoURL}
                style={avatar}
              />
              <div>
                <strong>@{user.username}</strong>
                <p style={name}>{user.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== ESTILOS ===== */

const container: React.CSSProperties = {
  maxWidth: 300,
  margin: "auto",
  position: "relative"
};

const input: React.CSSProperties = {
  width: "auto",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #ddd",
  fontSize: 15
};

const resultsBox: React.CSSProperties = {
  position: "absolute",
  top: "100%",        // justo debajo del input
  left: 0,
  right: 0,
  marginTop: 8,
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 8px 20px rgba(0,0,0,.08)",
  overflow: "hidden",
  zIndex: 1000,

  maxHeight: 260,     // 👈 evita que crezca infinito
  overflowY: "auto"   // scroll interno
};


const resultItem: React.CSSProperties = {
  display: "flex",
  gap: 12,
  padding: 12,
  cursor: "pointer",
  alignItems: "center",
 
};

const avatar: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  objectFit: "cover"
};

const name: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.7,
   color:"#0000"
};

const hint: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.6,
  marginTop: 6
};
