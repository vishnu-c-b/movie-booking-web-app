import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const checkAdmin = (Component) => {
  function Wrapper(props) {
    const user = useSelector((store) => store.auth.user);
    const navigate = useNavigate();

    useEffect(() => {
      if (!user) {
        navigate("/");
      } else if (user.username === "cb@admin.com") {
        navigate("/adminDash");
      }
    }, [user, navigate]);

    return user && user.username === "cb@admin.com" ? (
      <Component {...props} />
    ) : null;
  }

  return Wrapper;
};
