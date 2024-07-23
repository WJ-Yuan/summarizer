import { useEffect, useState } from "react"
import { FilledTextField, Icon, IconButton } from "../Proxy"
import "~/styles/pagination.scss"
import { $t } from "~/shared/utils"

interface PaginationProps {
  current: number
  total?: number
  size?: number
  onPageChange: (now: number) => void
}

const Pagination = ({
  current,
  total = 0,
  size = 10,
  onPageChange
}: PaginationProps) => {
  const MIN_PAGE = 1
  const [now, setNow] = useState<number>(MIN_PAGE)
  const [prev, setPrev] = useState<number>(now)
  const totalPage = total <= size ? MIN_PAGE : Math.ceil(total / size)

  const handleInputChange = (e: Event) => {
    const value = Number((e.target as HTMLInputElement)?.value)
    setNow(value)
  }

  useEffect(() => {
    if (now >= MIN_PAGE && now <= totalPage && /^\d+$/.test(`${now}`)) {
      setPrev(now)
      onPageChange(now)
    } else {
      setNow(prev)
    }
  }, [now])

  useEffect(() => {
    setNow(current)
  }, [current])

  return (
    <div
      className="pagination"
      aria-label={$t("common_components_pagination_description")}>
      <IconButton
        aria-label={$t("common_components_pagination_prev_description")}
        disabled={totalPage === MIN_PAGE || prev === MIN_PAGE}
        onClick={() => setNow((p) => p - MIN_PAGE)}>
        <Icon>chevron_left</Icon>
      </IconButton>
      <FilledTextField
        type="number"
        inputMode="numeric"
        className="input"
        step="1"
        min={"1"}
        aria-label={$t("common_components_pagination_input_description")}
        max={`${totalPage}`}
        disabled={totalPage === MIN_PAGE}
        value={`${now}`}
        onChange={handleInputChange}
      />
      <span className="splitter">/</span>
      <span className="total">{totalPage}</span>
      <IconButton
        aria-label={$t("common_components_pagination_next_description")}
        disabled={totalPage === MIN_PAGE || prev === totalPage}
        onClick={() => setNow((p) => p + MIN_PAGE)}>
        <Icon>chevron_right</Icon>
      </IconButton>
    </div>
  )
}

export default Pagination
