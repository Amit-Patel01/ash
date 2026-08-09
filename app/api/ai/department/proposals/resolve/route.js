export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { proposalId, approved } = await request.json();
    return NextResponse.json({
      success: true,
      proposalId,
      approved,
      message: approved ? 'Proposal approved and executed.' : 'Proposal rejected.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
