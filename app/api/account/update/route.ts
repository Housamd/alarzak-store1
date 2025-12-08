// app/api/account/update/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("customer_session");

    if (!session?.value) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const customerId = session.value;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    let name = (body.name as string | undefined)?.trim();
    let email = (body.email as string | undefined)?.trim();

    if (!name && !email) {
      return NextResponse.json(
        { error: "Nothing to update." },
        { status: 400 }
      );
    }

    if (email) {
      email = email.toLowerCase();
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        number: true,
        isAdmin: true,
      },
    });

    return NextResponse.json({
      ok: true,
      customer: updated,
    });
  } catch (err) {
    console.error("Account update error:", err);
    return NextResponse.json(
      { error: "Failed to update account." },
      { status: 500 }
    );
  }
}
