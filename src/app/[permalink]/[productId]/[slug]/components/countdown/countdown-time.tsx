"use client"

// import { useLocalStorage } from "usehooks-ts"
import DateTimeDisplay from "./datetime-display"
import { useCountdown } from "@/hooks/countdown"
// import { useEffect } from "react";

// const A_DAYS_IN_MS = 1 * 24 * 60 * 60 * 1000;
const NOW_IN_MS = new Date();
NOW_IN_MS.setHours(23, 59, 59, 999)
// const dateTimeAfterThreeDays = NOW_IN_MS + A_DAYS_IN_MS;
const dateTimeAfterThreeDays = NOW_IN_MS;

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

interface CountdownTimerxProps {
    targetDate: number
    teks_countdown: string
}

const CountdownTimerx = ({
    teks_countdown,
    targetDate
}: CountdownTimerxProps) => {
    const [days, hours, minutes, seconds] = useCountdown(targetDate)

    if ((days + hours + minutes + seconds) <= 0) return null

    return (
        <div className="w-full bg-stora-500 max-w-full mx-auto z-20 h-[50px] flex items-center">
            <div className="text-center flex-1">
                <h3 className="text-white uppercase text-[10px] font-medium">{teks_countdown}</h3>
                <div className="mt-0 text-white text-base font-medium">
                    {/* component */}
                    <ShowCounter
                        days={days}
                        hours={hours}
                        minutes={minutes}
                        seconds={seconds}
                    />
                </div>
            </div>
        </div>
    )
}

interface CountdownTimerProps {
    teks_countdown: string
}

const CountdownTimer = ({
    teks_countdown,
}: CountdownTimerProps) => {
    return (
        <CountdownTimerx
            teks_countdown={teks_countdown}
            targetDate={dateTimeAfterThreeDays.getTime()}
        />
    )
}

export default CountdownTimer
