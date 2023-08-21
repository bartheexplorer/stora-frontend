import { appConfig } from "@/entry-server/config/app"
import { prisma } from "@/entry-server/config/db"
import { getUser } from "@/entry-server/services/user"
import { NextRequest, NextResponse } from "next/server"
import * as crypto from "crypto"

export async function GET(_req: NextRequest, ctx: { params: { permalink: string } }) {
    const sha1Hash = (input: string): string => {
      const hash = crypto.createHash("sha1")
      hash.update(input)
      return hash.digest("hex")
    }

    const user = await getUser(prisma, ctx.params.permalink)

    console.log("use", user)

    if (!user) {
        return NextResponse.json({
            message: "User tidak ditemukan",
        }, {status: 401})
    }

    const getSession = async () => {
        const requestOptions: RequestInit = {
            method: 'GET',
        }

        const result = await fetch(
            `${appConfig.domain.ep}/session?session=${sha1Hash(user.id_user.toString())}`,
            requestOptions
        )
        const _body = await result.json()
        return _body
    }

    const res = await getSession()
    return NextResponse.json({
        data: res,
    })
}