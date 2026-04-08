interface Props {
  isMobile: boolean;
  logo: string;
  fbIcon: string;
  inIcon: string;
}

import React, { useState } from "react";
import ProfileSearch from "./ProfileSearch";
import { useNavigate } from "react-router-dom";

const Header: React.FC<Props> = ({ isMobile, logo, fbIcon, inIcon }) => {
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const bannerHeader: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "auto", // 🔥 full ancho real
    background: "#fff",
    borderBottom: "1px solid #e5e5e5",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: isMobile ? "0 8px" : "10px 28px",
    height: isMobile ? 56 : 70,

    margin: "0 auto"
  };

  const bannerLeft: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: "100%" // 🔥 clave
  };

  const bannerRight: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
    height: "100%" // 🔥 clave
  };

  const bannerSocial: React.CSSProperties = {
    display: "flex",
    gap: 8,
    alignItems: "center",
    height: "100%" // 🔥 clave
  };

  const bannerIcon: React.CSSProperties = {
    width: 26,
    height: 26,
    cursor: "pointer",
    display: "block" // 🔥 elimina espacios fantasmas
  };

  const linkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textDecoration: "none",
    lineHeight: 0 // 🔥 elimina baseline bug
  };

  return (
    <div style={bannerHeader}>

      <div style={bannerLeft}>
        <img
          src={logo}
          style={{
            width: isMobile ? 140 : 200,
            height: isMobile ? 50 : "100%", // 🔥 control real del logo
            objectFit: "contain",
            display: "block",
            cursor: "pointer"
          }}
          onClick={() => navigate("/")}
        />
      </div>

      <div style={bannerRight}>

        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            fontSize: 20,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            height: "100%" // 🔥 alinea perfecto con todo
          }}
        >
          {showSearch ? "✖" : "🔍"}
        </button>

        {showSearch && <ProfileSearch />}

        {/* REDES */}
        <div style={bannerSocial}>
          <a
            href="https://www.facebook.com/profile.php?id=61573291472194"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            <img src={fbIcon} style={bannerIcon} />
          </a>

          <a
            href="https://www.instagram.com/ladarkask?igsh=NjE4ZGpncGdoN2Uy"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            <img src={inIcon} style={bannerIcon} />
          </a>
        </div>

      </div>

    </div>
  );
};

export default Header;