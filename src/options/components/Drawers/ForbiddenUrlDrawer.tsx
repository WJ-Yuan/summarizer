import type { DrawerProps, ForbiddenUrl } from "Common"
import { useState } from "react"
import { Drawer, Icon, IconButton } from "~/components/Proxy"
import RemoveDialog from "~/components/RemoveDialog"
import { useStorage } from "~/hooks"
import { DrawerDialogType, StorageKey } from "~/shared/constants"
import { $t, exportJson, isForbiddenUrlValid } from "~/shared/utils"
import { parseFile } from "../../utils"
import { ForbiddenUrlDialog } from "../Details/SettingDialog"
import Table from "../Table"

const ForbiddenUrlDrawer = ({ open, onSave }: DrawerProps) => {
  const cols = [
    {
      key: "url",
      label: $t("options_col_url")
    }
  ]
  const [selected, setSelected] = useState<ForbiddenUrl>({
    url: "",
    id: NaN
  })
  const [tableData, setTableData] = useStorage<string[]>(
    StorageKey.ForbiddenUrl
  )
  const [removeOpen, setRemoveOpen] = useState<boolean>(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false)
  const [detailDialogType, setDetailDialogType] = useState<DrawerDialogType>(
    DrawerDialogType.Add
  )

  const onAdd = () => {
    setSelected({
      id: NaN,
      url: ""
    })
    setDetailDialogType(DrawerDialogType.Add)
    setDetailDialogOpen(true)
  }

  const onEdit = (row: ForbiddenUrl) => {
    setSelected({ ...row })
    setDetailDialogType(DrawerDialogType.Edit)
    setDetailDialogOpen(true)
  }

  const onRemove = (row: ForbiddenUrl) => {
    setSelected({ ...row })
    setRemoveOpen(true)
  }

  const onConfirmRemove = () => {
    const table = (tableData || []).filter((item) => item !== selected.url)
    setTableData(table)
    setRemoveOpen(false)
  }

  const onExport = () => {
    const data = (tableData || [])?.map((item) => {
      return { url: item }
    })
    exportJson(data, "url")
  }

  const onImported = async (file: File) => {
    const data = await parseFile(
      file,
      "url",
      cols.map((item) => item.key),
      (tableData || []).map((u, index) => ({
        url: u,
        id: index
      })),
      isForbiddenUrlValid
    )

    if (data.length) {
      setTableData([...data.map((data) => data.url), ...(tableData || [])])
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
          <div className="text">{$t("options_form_forbidden_url_header")}</div>
          <IconButton className="close-icon" onClick={onSave}>
            <Icon>close</Icon>
          </IconButton>
        </h1>
      </header>

      <main className="drawer-content">
        <Table
          open={open}
          cols={cols}
          tableData={(tableData || []).map((url, index) => ({
            url: url,
            id: index
          }))}
          onAdd={onAdd}
          onEdit={onEdit}
          onRemove={onRemove}
          onExport={onExport}
          onImported={onImported}
        />
      </main>

      <RemoveDialog
        open={removeOpen}
        detail={$t("options_forbidden_url_remove_detail", [selected.url])}
        onCancel={() => setRemoveOpen(false)}
        onConfirm={onConfirmRemove}
      />

      {detailDialogOpen && (
        <ForbiddenUrlDialog
          type={detailDialogType}
          row={selected}
          onSave={() => setDetailDialogOpen(false)}
          onClose={() => setDetailDialogOpen(false)}
        />
      )}
    </Drawer>
  )
}

export default ForbiddenUrlDrawer
