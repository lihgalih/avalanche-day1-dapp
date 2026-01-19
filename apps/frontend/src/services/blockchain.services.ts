const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}

export async function getBlockchainValue() {
    const res = await fetch(`${BACKEND_URL}/blockchain/value`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch blockchain value");
    }

    return res.json();
}

export async function getBlockchainEvents() {
    const res = await fetch(`${BACKEND_URL}/blockchain/events`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch blockchain events");
    }

    return res.json();
}
