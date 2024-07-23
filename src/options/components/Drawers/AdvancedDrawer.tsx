import type { Advanced, DrawerProps } from "Common"
import { useState } from "react"
import { Drawer, Icon, IconButton } from "~/components/Proxy"
import RemoveDialog from "~/components/RemoveDialog"
import { useStorage } from "~/hooks"
import { DrawerDialogType, StorageKey } from "~/shared/constants"
import { $t, exportJson, isAdvancedRuleValid } from "~/shared/utils"
import { parseFile } from "../../utils"
import AdvancedDetail from "../Details/AdvancedDetail"
import Table from "../Table"

enum AdvancedPageType {
  Table,
  Detail
}

const AdvancedDrawer = ({ open, onSave }: DrawerProps) => {
  const cols = [
    {
      key: "url",
      label: $t("options_col_url")
    },
    {
      key: "javascript",
      label: $t("options_col_javascript")
    }
  ]

  const [selected, setSelected] = useState<Advanced>({
    url: "",
    javascript: "",
    id: NaN
  })
  const [tableData, setTableData] = useStorage<Advanced[]>(
    StorageKey.AdvancedRule
  )
  const [removeOpen, setRemoveOpen] = useState<boolean>(false)
  const [pageType, setPageType] = useState<AdvancedPageType>(
    AdvancedPageType.Table
  )
  const [detailType, setDetailType] = useState<DrawerDialogType>(
    DrawerDialogType.Add
  )

  const onAdd = () => {
    setSelected({
      id: NaN,
      url: "",
      javascript: ""
    })
    setPageType(AdvancedPageType.Detail)
    setDetailType(DrawerDialogType.Add)
  }

  const onEdit = (row: Advanced, index: number) => {
    setSelected({ ...row })
    setPageType(AdvancedPageType.Detail)
    setDetailType(DrawerDialogType.Edit)
  }

  const onRemove = (row: Advanced) => {
    setSelected({ ...row })
    setRemoveOpen(true)
  }

  const onConfirmRemove = () => {
    const table = (tableData || []).filter((item) => item.url !== selected.url)
    setTableData(table)
    setRemoveOpen(false)
  }

  const onImported = async (file: File) => {
    const data = await parseFile(
      file,
      "url",
      cols.map((col) => col.key),
      tableData || [],
      isAdvancedRuleValid
    )

    if (data.length) {
      setTableData([...(data as Advanced[]), ...(tableData || [])])
    }
  }

  return (
    <Drawer
      modal
      closeOnEsc
      closeOnOverlayClick
      placement="right"
      className="drawer"
      open={open}
      onClose={() => {
        setPageType(AdvancedPageType.Table)
        onSave()
      }}>
      <header className="drawer-header">
        <h1 className="title">
          {pageType === AdvancedPageType.Detail && (
            <IconButton
              className="back-icon mr-12"
              onClick={() => setPageType(AdvancedPageType.Table)}>
              <Icon>arrow_back</Icon>
            </IconButton>
          )}
          <div className="text">{$t("options_form_advanced_rule_header")}</div>
          <IconButton className="close-icon" onClick={onSave}>
            <Icon>close</Icon>
          </IconButton>
        </h1>
      </header>

      <main
        className={`drawer-content ${pageType === AdvancedPageType.Detail ? "advanced-form" : ""}`}>
        {pageType === AdvancedPageType.Table ? (
          <Table
            open={open}
            cols={cols}
            tableData={(tableData || []).map((item, index) => ({
              ...item,
              id: index
            }))}
            onAdd={onAdd}
            onEdit={onEdit}
            onRemove={onRemove}
            onExport={() => exportJson(tableData || [], "rule")}
            onImported={onImported}
          />
        ) : (
          <AdvancedDetail
            type={detailType}
            row={selected}
            onSave={() => setPageType(AdvancedPageType.Table)}
            onClose={() => setPageType(AdvancedPageType.Table)}
          />
        )}

        <RemoveDialog
          open={removeOpen}
          detail={$t("options_advanced_rule_remove_detail", [selected.url])}
          onCancel={() => setRemoveOpen(false)}
          onConfirm={onConfirmRemove}
        />
      </main>
    </Drawer>
  )
}

export default AdvancedDrawer
