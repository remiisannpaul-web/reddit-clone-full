// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function Dashboard() {
    return(
        <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
    )
}