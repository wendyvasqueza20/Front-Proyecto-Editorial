
// src/components/Clientes/ClientesTable.jsx
import React, { useMemo, useState } from 'react'
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getSortedRowModel,
  getPaginationRowModel,
  flexRender 
} from '@tanstack/react-table'
import { Spinner } from 'react-bootstrap'
import './Clientes.css'

const ClientesTable = ({ 
  data, 
  loading, 
  onEdit, 
  onStatusChange,
  onAddClient,
  globalFilter,
  onGlobalFilterChange,
  tiposClientes,
  filtroEstado,
  onFiltroEstadoChange,
  onBatchAction
}) => {
  // ✅ Estado para selección de filas
  const [rowSelection, setRowSelection] = useState({})

  // ✅ Componente para headers ordenables mejorado
  const SortableHeader = ({ column, title }) => {
    const isSorted = column.getIsSorted();
    
    return (
      <div 
        className="sortable-header"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="header-title">{title}</span>
        <div className="sort-indicators">
          <i 
            className={`bi bi-caret-up-fill ${
              isSorted === 'asc' ? 'active' : ''
            }`}
          ></i>
          <i 
            className={`bi bi-caret-down-fill ${
              isSorted === 'desc' ? 'active' : ''
            }`}
          ></i>
        </div>
      </div>
    );
  };

  // ✅ Definición de columnas mejorada
  const columns = useMemo(() => [
    // Columna de selección
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          title="Seleccionar todos"
          className="selection-checkbox"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          title="Seleccionar cliente"
          className="selection-checkbox"
        />
      ),
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: 'id_cliente',
      header: ({ column }) => (
        <SortableHeader column={column} title="ID" />
      ),
      size: 80,
      enableSorting: true,
      cell: ({ getValue }) => (
        <div className="cell-content centered">
          {getValue()}
        </div>
      )
    },
    {
      accessorKey: 'nombres_cliente',
      header: ({ column }) => (
        <SortableHeader column={column} title="Cliente" />
      ),
      enableSorting: true,
      cell: ({ row }) => (
        <div className="cell-content">
          {row.original.nombres_cliente} {row.original.apellidos_cliente}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: 'identidad',
      header: ({ column }) => (
        <SortableHeader column={column} title="Identidad" />
      ),
      enableSorting: true,
      cell: ({ getValue }) => (
        <div className="cell-content centered">
          {getValue() || '—'}
        </div>
      ),
      size: 140,
    },
    {
      accessorKey: 'correo',
      header: ({ column }) => (
        <SortableHeader column={column} title="Correo" />
      ),
     enableSorting: true,
     cell: ({ getValue }) => {
      const correo = getValue();
    
        if (!correo) {
          return (
           <div className="cell-content multiline">
            <span>—</span>
          </div>
        );
      }

      // Truncar correos muy largos
      const correoTruncado = correo.length > 25 
        ? `${correo.substring(0, 25)}...`
        : correo;

        return (
         <div className="cell-content multiline">
           <div 
             className="cell-email"
             title={correo} // Tooltip con el correo completo
           >
           {correoTruncado}
           </div>
         </div>
       );
      },
     size: 160, // Aún más reducido
    },
    {
      accessorKey: 'direccion',
      header: 'Dirección',
      cell: ({ getValue }) => (
        <div className="cell-content">
          {getValue() || '—'}
        </div>
      ),
      size: 180,
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      cell: ({ getValue }) => (
        <div className="cell-content centered">
          {getValue() || '—'}
        </div>
      ),
      size: 130,
    },
    {
      accessorKey: 'id_tipo_cliente',
      header: 'Tipo',
      cell: ({ getValue }) => {
        const tipo = tiposClientes.find(t => t.value === getValue());
        return (
          <div className="cell-content centered">
            {tipo?.label || '—'}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'estado_cliente',
      header: ({ column }) => (
        <SortableHeader column={column} title="Estado" />
      ),
      enableSorting: true,
      cell: ({ getValue }) => (
        <div className="cell-content centered">
          <span className={`badge-estado ${getValue() === 'activo' ? 'badge-activo' : 'badge-inactivo'}`}>
            {getValue() === 'activo' ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>
      ),
      size: 110,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="cell-content centered">
          <div className="acciones-group">
            <button
              className="btn-editar"
              onClick={() => onEdit(row.original)}
              title="Editar cliente"
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button
              className={`btn-estado ${row.original.estado_cliente === 'activo' ? 'btn-desactivar' : 'btn-activar'}`}
              onClick={() => onStatusChange(
                row.original.id_cliente, 
                `${row.original.nombres_cliente} ${row.original.apellidos_cliente}`,
                row.original.estado_cliente
              )}
              title={row.original.estado_cliente === 'activo' ? 'Desactivar cliente' : 'Activar cliente'}
            >
              <i className={`bi ${row.original.estado_cliente === 'activo' ? 'bi-person-x' : 'bi-person-check'}`}></i>
            </button>
          </div>
        </div>
      ),
      size: 140,
      enableSorting: false,
    },
  ], [tiposClientes, onEdit, onStatusChange]);

  // ✅ Configuración de TanStack Table
  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      globalFilter,
      rowSelection,
    },
    onGlobalFilterChange,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    getRowId: (originalRow) => originalRow.id_cliente.toString(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchTerm = filterValue.toLowerCase();
      return (
        row.original.nombres_cliente?.toLowerCase().includes(searchTerm) ||
        row.original.apellidos_cliente?.toLowerCase().includes(searchTerm) ||
        row.original.identidad?.toLowerCase().includes(searchTerm) ||
        row.original.correo?.toLowerCase().includes(searchTerm) ||
        row.original.telefono?.toLowerCase().includes(searchTerm)
      );
    },
  });

  // ✅ Handler para acciones batch
  const handleBatchAction = (action) => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    
    if (onBatchAction) {
      onBatchAction(action, selectedIds);
    }
  };

  // ✅ Contador de seleccionados
  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="clientes-container">
      {/* Header con título y botón agregar */}
      <div className="clientes-header">
        <div className="header-titles">
          <h1 className="clientes-title">Gestión de Clientes</h1>
          <p className="clientes-desc">Administra todos los clientes del sistema</p>
        </div>
        <button 
          className="btn-agregar"
          onClick={onAddClient}
          title="Agregar nuevo cliente"
        >
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Cliente
        </button>
      </div>

      {/* Barra de Acciones Batch - CORREGIDA */}
      {selectedCount > 0 && (
        <div className="batch-actions-bar">
          <div className="batch-content">
            <span className="batch-count">
              {selectedCount} cliente{selectedCount > 1 ? 's' : ''} seleccionado{selectedCount > 1 ? 's' : ''}
            </span>
            <div className="batch-buttons">
              <button
                className="btn-batch-desactivar"
                onClick={() => handleBatchAction('desactivar')}
              >
                <i className="bi bi-person-x me-1"></i>
                Desactivar Seleccionados
              </button>
              <button
                className="btn-batch-activar"
                onClick={() => handleBatchAction('activar')}
              >
                <i className="bi bi-person-check me-1"></i>
                Activar Seleccionados
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setRowSelection({})}
              >
                <i className="bi bi-x-circle me-1"></i>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="clientes-card">
        {/* Controles de Filtro y Búsqueda */}
        <div className="clientes-filters">
          <div className="filter-group search-group">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar cliente..."
                value={globalFilter}
                onChange={(e) => onGlobalFilterChange(e.target.value)}
              />
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
            </div>
          </div>

          <div className="filter-group">
            <select
              className="form-select"
              value={filtroEstado}
              onChange={(e) => onFiltroEstadoChange(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Solo activos</option>
              <option value="inactivo">Solo inactivos</option>
            </select>
          </div>

          {/* Información de registros */}
          <div className="pagination-info">
            {!loading && (
              <>
                <strong>{data.length}</strong> cliente{data.length !== 1 ? 's' : ''} encontrado{data.length !== 1 ? 's' : ''}
              </>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="table-container">
          <table className="clientes-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      style={{ width: header.column.columnDef.size }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="clientes-loading">
                    <Spinner animation="border" className="me-2" />
                    Cargando clientes...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="clientes-empty">
                    <i className="bi bi-people"></i>
                    <div className="empty-title">No se encontraron clientes</div>
                    {globalFilter && (
                      <div className="empty-desc">
                        Intenta con otros términos de búsqueda
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id}
                    className={row.getIsSelected() ? 'selected-row' : ''}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {table.getPageCount() > 1 && (
          <div className="clientes-pagination">
            <div className="pagination-info">
              Mostrando <strong>{table.getRowModel().rows.length}</strong> de{' '}
              <strong>{table.getFilteredRowModel().rows.length}</strong> registros
            </div>
            
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
                title="Primera página"
              >
                <i className="bi bi-chevron-double-left"></i>
              </button>
              <button
                className="pagination-btn"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                title="Página anterior"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              
              <span className="pagination-page">
                Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de <strong>{table.getPageCount()}</strong>
              </span>
              
              <button
                className="pagination-btn"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                title="Página siguiente"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
              <button
                className="pagination-btn"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
                title="Última página"
              >
                <i className="bi bi-chevron-double-right"></i>
              </button>
              
              <select
                className="page-size-select"
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value));
                  table.setPageIndex(0);
                }}
              >
                {[10, 20, 30, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} por página
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientesTable