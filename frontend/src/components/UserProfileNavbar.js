import Link from "next/link";

export function UserProfileNavbar() {
  return (
    <>
      <Link href='/profile/u/session-history'>
        <a
          className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
          Session History
        </a>
      </Link>
      <Link href='/profile/u/billing'>
        <a
          className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
          Billing
        </a>
      </Link>
    </>
  )
}
