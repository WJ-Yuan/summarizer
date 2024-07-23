import { ChangeEventHandler, useEffect, useRef, useState } from "react"
import Pagination from "~/components/Pagination"
import {
  FilledButton,
  FilledTonalButton,
  Icon,
  IconButton,
  OutlinedButton
} from "~/components/Proxy"
import { usePrevious } from "~/hooks"
import { $t } from "~/shared/utils"
import "~/styles/table.scss"

interface Col {
  key: string
  label: string
}

interface TableProps {
  open: boolean
  cols: Col[]
  tableData: Record<string, any>[]
  onAdd: () => void
  onEdit: (row: any, index: number) => void
  onRemove: (row: any, index: number) => void
  onExport: () => void
  onImported: (file: File) => void
}

const EmptyMsg = ({
  tip = $t("options_table_empty"),
  colSpan
}: {
  tip?: string
  colSpan: number
}) => {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="empty">{tip}</div>
      </td>
    </tr>
  )
}

const Table = ({
  open,
  cols,
  tableData,
  onAdd,
  onEdit,
  onRemove,
  onExport,
  onImported
}: TableProps) => {
  const PAGE_SIZE = 10
  const importRef = useRef<HTMLInputElement>(null)
  const [page, setPage] = useState<number>(1)
  const renderTable = tableData.slice(
    PAGE_SIZE * (page - 1),
    PAGE_SIZE * (page - 1) + PAGE_SIZE
  )
  const previous = usePrevious<Record<string, any>[]>(tableData)

  const onPageChange = (current: number) => {
    setPage(current)
  }

  useEffect(() => {
    if (previous && previous.length !== tableData.length) {
      setPage(1)
    }
  }, [tableData])

  const onImport = (e: Event) => {
    e.stopPropagation()
    importRef.current?.click()
  }

  const onImportChange: ChangeEventHandler = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    onImported(file)
  }

  // HACK: init page when open/close side drawer
  useEffect(() => {
    setPage(1)
  }, [open])

  return (
    <section className="table">
      <div className="table-header-action">
        <FilledButton className="mr-6" onClick={onAdd}>
          <Icon slot="icon">add</Icon>
          <span>{$t("common_action_add")}</span>
        </FilledButton>
        <FilledTonalButton className="mr-6" onClick={onImport}>
          <span>
            {$t("common_action_import")}
            <input
              ref={importRef}
              type="file"
              className="import"
              accept=".json"
              multiple={false}
              onChange={onImportChange}
            />
          </span>
        </FilledTonalButton>
        <OutlinedButton disabled={tableData.length <= 0} onClick={onExport}>
          <span>{$t("common_action_export")}</span>
        </OutlinedButton>
      </div>
      <table className="table-data">
        <colgroup>
          {cols.map((col) => {
            return <col key={col.key} width="auto" />
          })}
          <col width="120px" />
        </colgroup>
        <thead>
          <tr>
            {cols.map((col) => {
              return <th key={col.key}>{col.label}</th>
            })}
            <th>{$t("options_table_header_action")}</th>
          </tr>
        </thead>
        <tbody>
          {!!tableData.length ? (
            renderTable.map((row, index) => {
              return (
                <tr key={row.id}>
                  {cols.map((col) => (
                    <td key={`${row.id}-${col.key}`} title={row[col.key]}>
                      {row[col.key] || "--"}
                    </td>
                  ))}
                  <td>
                    <IconButton
                      aria-label={$t("common_action_edit")}
                      onClick={() => onEdit(row, index)}>
                      <Icon>edit</Icon>
                    </IconButton>
                    <IconButton
                      aria-label={$t("common_action_delete")}
                      onClick={() => onRemove(row, index)}>
                      <Icon>delete_outline</Icon>
                    </IconButton>
                  </td>
                </tr>
              )
            })
          ) : (
            <EmptyMsg colSpan={cols.length + 1} />
          )}
        </tbody>
      </table>

      {tableData.length ? (
        <Pagination
          size={PAGE_SIZE}
          current={page}
          total={tableData.length}
          onPageChange={onPageChange}
        />
      ) : (
        <></>
      )}
    </section>
  )
}

export default Table
