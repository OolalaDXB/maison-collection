import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="dark-section section-padding">
      <div className="max-container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Link
              to="/"
              className="font-body uppercase tracking-[0.05em] font-light text-lg text-[hsl(0,0%,100%)]"
            >
              MAISONS
            </Link>
            <p className="mt-3 text-sm text-[hsl(0,0%,60%)]">
              Houses with a point of view.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <p className="text-sm text-[hsl(0,0%,60%)]">
              Brittany · Georgia · Dubai
            </p>
            <p className="text-[0.75rem] text-[#666666]">
              Made by The Studio MT
            </p>
            <p className="text-xs text-[hsl(0,0%,45%)]">
              <span
                onClick={() => navigate("/admin/login")}
                className="select-text"
              >
                &copy;
              </span>{" "}
              2026 Maisons. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
