import React from "react";
import ProfileSearch from "./ProfileSearch";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  isMobile: boolean;
  logo: string;
  fbIcon: string;
  inIcon: string;
}
  const navigate = useNavigate();
const [showSearch, setShowSearch] = useState(false);
const Header: React.FC<Props> = ({ isMobile, logo, fbIcon, inIcon }) => {

  const bannerHeader: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%",
    background: "#fff",
    borderBottom: "1px solid #e5e5e5",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: isMobile ? "8px 14px" : "10px 28px",
    height: isMobile ? 56 : 64,

   maxWidth: isMobile ? 500 : 1200,
    margin: "0 auto"
  };

  const bannerLeft: React.CSSProperties = {
    display: "flex",
    alignItems: "center"
  };

  const bannerRight: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 14
  };

  const bannerSocial: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "center"
  };

  const bannerIcon: React.CSSProperties = {
    width: 26,
    height: 26,
    cursor: "pointer"
  };

  return (
    <div style={bannerHeader}>

      <div style={bannerLeft}>
        <img
          src={logo}
          style={{
            width: isMobile ? 140 : 200,
            height: "auto",
            objectFit: "contain",
            display: "block",
            cursor: "pointer"
          }}
                  onClick={() => navigate(`/`)}
        />
      </div>

      <div style={bannerRight}>

            <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
                fontSize: 20,
                border: "none",
                background: "transparent",
                cursor: "pointer"
            }}
            >
            {showSearch ? "✖" : "🔍"}
            </button>
            {(!isMobile || showSearch) && <ProfileSearch />}
        {/* REDES */}
        <div style={bannerSocial}>
          <img src={fbIcon} style={bannerIcon} />
          <img src={inIcon} style={bannerIcon} />
        </div>

      </div>

    </div>
  );
};

export default Header;