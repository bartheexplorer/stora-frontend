export default function DateTimeDisplay({
    value,
    type,
    isDanger,
}: {
    value: number
    type: string
    isDanger: boolean
}) {
    return (
        <div className={isDanger ? 'text-red-500' : 'text-gray-50'}>
            <div className="text-semibold text-xs">{value}</div>
            <div className="-mt-1 text-semibold text-xs">{type}</div>
        </div>
    )
}
