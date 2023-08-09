import type { t_kupon as TCoupon } from "@prisma/client"

export type TCouponResult = {
  id_kupon: TCoupon["id_kupon"]
  kupon: TCoupon["kupon"]
  diskon: TCoupon["diskon"]
  tipe: TCoupon["tipe"]
  jumlah_batas: TCoupon["jumlah_batas"]
  is_active: TCoupon["is_active"]
  kupon_terpakai: number
  x: number
}