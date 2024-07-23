import type { DrawerProps, Filter } from "Common"
import { useState } from "react"
import { Drawer, Icon, IconButton } from "~/components/Proxy"
import RemoveDialog from "~/components/RemoveDialog"
import { useStorage } from "~/hooks"
import { DrawerDialogType, StorageKey } from "~/shared/constants"
import { $t, exportJson, isSensitiveFilterValid } from "~/shared/utils"
import { parseFile } from "../../utils"
import { SensitiveFilterDialog } from "../Details/SettingDialog"
import Table from "../Table"

const SensitiveFilterDrawer = ({ open, onSave }: DrawerProps) => {
  const cols = [
    {
      key: "sensitive",
      label: $t("options_filter_sensitive_label")
    },
    {
      key: "replacement",
      label: $t("options_filter_replacement_label")
    }
  ]
  const [selected, setSelected] = useState<Filter>({
    sensitive: "",
    replacement: "",
    id: NaN
  })
  const [tableData, setTableData] = useStorage<Filter[]>(
    StorageKey.SensitiveFilter
  )
  const [removeOpen, setRemoveOpen] = useState<boolean>(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false)
  const [detailDialogType, setDetailDialogType] = useState<DrawerDialogType>(
    DrawerDialogType.Add
  )

  const onAdd = () => {
    setSelected({
      id: NaN,
      sensitive: "",
      replacement: ""
    })
    setDetailDialogType(DrawerDialogType.Add)
    setDetailDialogOpen(true)
  }

  const onEdit = (row: Filter) => {
    setSelected({ ...row })
    setDetailDialogType(DrawerDialogType.Edit)
    setDetailDialogOpen(true)
  }

  const onRemove = (row: Filter) => {
    setSelected({ ...row })
    setRemoveOpen(true)
  }

  const onConfirmRemove = () => {
    const table = (tableData || []).filter(
      (item) => item.sensitive !== selected.sensitive
    )

    setTableData(table)
    setRemoveOpen(false)
  }

  const onImported = async (file: File) => {
    const data = await parseFile(
      file,
      "sensitive",
      cols.map((col) => col.key),
      tableData || [],
      isSensitiveFilterValid
    )

    if (data) {
      setTableData([...(data as Filter[]), ...(tableData || [])])
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
      onClose={onSave}>
      <header className="drawer-header">
        <h1 className="title">
          <div className="text">{$t("options_form_filter_header")}</div>
          <IconButton className="close-icon" onClick={onSave}>
            <Icon>close</Icon>
          </IconButton>
        </h1>
      </header>
      <main className="drawer-content">
        <Table
          open={open}
          cols={cols}
          tableData={(tableData || []).map((filter, index) => ({
            ...filter,
            id: index
          }))}
          onAdd={onAdd}
          onEdit={onEdit}
          onRemove={onRemove}
          onExport={() => exportJson(tableData || [], "filter")}
          onImported={onImported}
        />
      </main>
      <RemoveDialog
        open={removeOpen}
        detail={$t("options_filter_remove_detail", [selected.sensitive!])}
        onCancel={() => setRemoveOpen(false)}
        onConfirm={onConfirmRemove}
      />
      {detailDialogOpen && (
        <SensitiveFilterDialog
          type={detailDialogType}
          row={selected}
          onSave={() => setDetailDialogOpen(false)}
          onClose={() => setDetailDialogOpen(false)}
        />
      )}
    </Drawer>
  )
}

export default SensitiveFilterDrawer
