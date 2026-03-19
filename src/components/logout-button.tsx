import { logoutAction } from "@/app/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="button button-secondary" type="submit">
        Sign out
      </button>
    </form>
  );
}
