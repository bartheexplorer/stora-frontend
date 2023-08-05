"use client"

import DateTimeDisplay from "./datetime-display"
import { useCountdown } from "@/hooks/countdown"

const THREE_DAYS_IN_MS = 1 * 24 * 60 * 60 * 1000;
const NOW_IN_MS = new Date().getTime();
const dateTimeAfterThreeDays = NOW_IN_MS + THREE_DAYS_IN_MS;

const ExpiredNotice = () => {
    return (
        <div className="expired-notice">
            <span>Expired!!!</span>
            <p>Please select a future date and time.</p>
        </div>
    )
}

const ShowCounter = ({
    days,
    hours,
    minutes,
    seconds,
}: {
    days: number
    hours: number
    minutes: number
    seconds: number
}) => {
    return (
        <div className="flex space-x-1.5 items-center justify-center">
            <DateTimeDisplay value={days} type={'Days'} isDanger={false} />
            <span>:</span>
            <DateTimeDisplay value={hours} type={'Hours'} isDanger={false} />
            <span>:</span>
            <DateTimeDisplay value={minutes} type={'Mins'} isDanger={false} />
            <span>:</span>
            <DateTimeDisplay value={seconds} type={'Seconds'} isDanger={false} />
        </div>
    )
}

const CountdownTimer = ({ targetDate = dateTimeAfterThreeDays }: { targetDate?: number }) => {
    const [days, hours, minutes, seconds] = useCountdown(targetDate)

    if ((days + hours + minutes + seconds) <= 0) return <ExpiredNotice />

    return (
        <ShowCounter
            days={days}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
        />
    )
}

export default CountdownTimer
