import { Link } from "@tanstack/react-router";

import UserMenu from "./user-menu";

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-4 py-2">
        <Link
          to="/"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Wajeer
        </Link>
        <div className="flex items-center gap-3">
          <UserMenu />
        </div>
      </div>
      <hr className="border-border" />
    </div>
  );
}
