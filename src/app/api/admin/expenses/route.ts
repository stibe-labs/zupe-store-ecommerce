import { NextRequest, NextResponse } from "next/server";
import { getExpenses, addExpense, deleteExpense, ExpenseRecord } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const expenses = await getExpenses(category);

    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    return NextResponse.json({
      success: true,
      expenses,
      totalExpense,
      categoryTotals,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, amount, date, vendor, reference_no, notes } = body;

    if (!category || !amount || !date) {
      return NextResponse.json(
        { success: false, error: "Category, amount, and date are required" },
        { status: 400 }
      );
    }

    const newExpense = await addExpense({
      category,
      amount: Number(amount),
      date,
      vendor,
      reference_no,
      notes,
    });

    return NextResponse.json({ success: true, expense: newExpense });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Expense ID is required" },
        { status: 400 }
      );
    }

    await deleteExpense(id);
    return NextResponse.json({ success: true, message: "Expense deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
