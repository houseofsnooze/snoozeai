import { NextRequest, NextResponse } from "next/server";
import * as kvdb from "@/db/kvdb";
import { User } from "@/helpers/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.command == "checkValidAccessCode") {
    return handleCheckValidAccessCode(body.accessCode as string);
  }
  if (body.command == "saveUser") {
    return handleSaveUser(body.user as User);
  }
  return NextResponse.json({ message: "Invalid command" }, { status: 400 });
}

async function handleSaveUser(user: User): Promise<NextResponse> {
  if (!user.email) {
    return NextResponse.json({ message: "Invalid user" }, { status: 400 });
  }
  const saved = await kvdb.saveUser(user);
  if (saved) {
    return NextResponse.json({ message: "User saved" });
  } else {
    return NextResponse.json({ message: "User not saved" }, { status: 500 });
  }
}

async function handleCheckValidAccessCode(
  accessCode: string
): Promise<NextResponse> {
  const valid = await kvdb.checkValidAccessCode(accessCode);
  if (valid) {
    return NextResponse.json({ message: "Access code valid" });
  } else {
    return NextResponse.json(
      { message: "Access code invalid" },
      { status: 400 }
    );
  }
}
