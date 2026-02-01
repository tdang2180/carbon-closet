import { NextResponse } from "next/server";
export async function GET() {
	try{
		return NextResponse.json({Hello: "hello"})
	} catch(error){
		console.log(error)
	}
}
