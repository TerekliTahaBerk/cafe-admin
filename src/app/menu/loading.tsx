/** Skeleton from the design (1e): header, chip bar and five rows. */
export default function MenuLoading() {
  return (
    <div aria-busy="true" aria-label="Menü yükleniyor" className="animate-pulse-soft">
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-[18px] md:hidden">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-neutral-200" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-4 w-28 rounded bg-neutral-200" />
            <div className="h-2.5 w-36 rounded bg-neutral-200" />
          </div>
        </div>
        <div className="mt-2 h-8 w-64 rounded bg-neutral-200" />
        <div className="h-3 w-full rounded bg-neutral-200" />
      </div>
      <div className="hidden h-[76px] items-center gap-4 border-b border-divider px-14 md:flex">
        <div className="size-[42px] rounded-full bg-neutral-200" />
        <div className="h-5 w-32 rounded bg-neutral-200" />
        <div className="ml-auto h-11 w-[340px] rounded-lg bg-neutral-200" />
      </div>
      <div className="flex gap-2 border-b border-divider px-5 py-2 md:hidden">
        {[96, 112, 72, 120].map((w) => (
          <div key={w} style={{ width: w }} className="h-11 flex-none rounded-full bg-neutral-200" />
        ))}
      </div>
      <div className="px-5 md:mx-auto md:max-w-3xl md:pt-12">
        <div className="pt-[26px]">
          <div className="h-[22px] w-[170px] rounded bg-neutral-200" />
          {[1, 2, 3, 4, 5].map((k) => (
            <div key={k} className="flex gap-3.5 border-b border-divider py-4">
              <div className="size-[88px] flex-none rounded-lg bg-neutral-200" />
              <div className="flex flex-1 flex-col gap-[9px] pt-1">
                <div className="flex justify-between">
                  <div className="h-4 w-[52%] rounded bg-neutral-200" />
                  <div className="h-4 w-[42px] rounded bg-neutral-200" />
                </div>
                <div className="h-2.5 w-[92%] rounded bg-neutral-200" />
                <div className="h-2.5 w-[68%] rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
