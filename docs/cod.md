cod single

```jsx
{product.typeProduct === "fisik" && (
    <div className="flex flex-col">
        <RadioGroup.Item
            key="COD"
            className={clsx(
                "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                "COD" === value?.id.toString() ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
            )}
            value={JSON.stringify({
                id: "COD",
                payment_method: "COD"
            })}
            id="COD"
        >
            {/* <li
            className={clsx(
                "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                "COD" === value?.id.toString() ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
            )}
        > */}
            <div className="flex items-center gap-2">
                <div className="w-12 h-5 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <BankLogo id="cod" />
                </div>
                <p className="text-xs text-gray-800 font-semibold uppercase">
                    {`COD (Cash On Delivery)`}
                </p>
            </div>
            {/* <button
                type="button"
                className="absolute inset-0"
                onClick={(event) => {
                    event.preventDefault()
                    onChange({
                        id: "COD",
                        payment_method: "COD"
                    })
                }}
            >&nbsp;</button> */}
        </RadioGroup.Item>
    </div>
)}
```

cod ulti
```jsx
{product.typeProduct === "fisik" && (
    <div className="flex flex-col">
        <RadioGroup.Item
            key="COD"
            className={clsx(
                "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                "COD" === value?.id.toString() ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
            )}
            value={JSON.stringify({
                id: "COD",
                payment_method: "COD"
            })}
            id="COD"
        >
            {/* <li
            className={clsx(
                "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                "COD" === value?.id.toString() ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
            )}
        > */}
            <div className="flex items-center gap-2">
                <div className="w-12 h-5 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <BankLogo id="cod" />
                </div>
                <p className="text-xs text-gray-800 font-semibold uppercase">
                    {`COD (Cash On Delivery)`}
                </p>
            </div>
            {/* <button
                type="button"
                className="absolute inset-0"
                onClick={(event) => {
                    event.preventDefault()
                    onChange({
                        id: "COD",
                        payment_method: "COD"
                    })
                }}
            >&nbsp;</button> */}
        </RadioGroup.Item>
    </div>
)}
```