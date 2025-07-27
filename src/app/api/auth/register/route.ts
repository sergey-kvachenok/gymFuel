import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true },
    });
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: 'Registration failed',
        details:
          process.env.NODE_ENV === 'production'
            ? undefined
            : error instanceof Error
              ? error.message
              : String(error),
      },
      { status: 500 },
    );
  }
}
