import { NextRequest, NextResponse } from 'next/server';

// Esta API se implementará en la Fase 2
export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'API en construcción - Fase 2' }, { status: 501 });
}
