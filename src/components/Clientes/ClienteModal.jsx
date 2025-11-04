
//src/components/Clientes/ClienteModal.jsx
import React, { useState, useEffect } from 'react'
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap'

const ClienteModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  formData, 
  onChange, 
  editId,
  loading = false 
}) => {
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [localFormData, setLocalFormData] = useState({
    nombres_cliente: '',
    apellidos_cliente: '',
    identidad: '',
    direccion: '',
    telefono: '',
    correo: '',
    id_tipo_cliente: '',
  })

  const tiposClientes = [
    { value: '', label: 'Seleccione el tipo de cliente' },
    { value: 1, label: 'Minorista' },
    { value: 2, label: 'Mayorista' },
    { value: 3, label: 'Institucional' },
  ]

  // Sincronizar formData con localFormData cuando cambia
  useEffect(() => {
    if (show) {
      setLocalFormData({
        nombres_cliente: formData.nombres_cliente || '',
        apellidos_cliente: formData.apellidos_cliente || '',
        identidad: formData.identidad || '',
        direccion: formData.direccion || '',
        telefono: formData.telefono || '',
        correo: formData.correo || '',
        id_tipo_cliente: formData.id_tipo_cliente || '',
      })
    }
  }, [show, formData])

  // Manejar cambio de campos
  const handleChange = (e) => {
    const { name, value } = e.target
    
    let processedValue = value
    
    // Convertir a mayúsculas solo para nombres y apellidos (solo al escribir)
    if ((name === 'nombres_cliente' || name === 'apellidos_cliente') && value) {
      processedValue = value.toUpperCase()
    }
    
    // Actualizar estado local
    const updatedFormData = {
      ...localFormData,
      [name]: processedValue
    }
    setLocalFormData(updatedFormData)
    
    // Llamar la función onChange del padre con el nombre y valor procesado
    onChange({
      target: {
        name: name,
        value: processedValue
      }
    })
    
    // Validar el campo
    const newErrors = validateField(name, processedValue)
    setErrors(newErrors)
  }

  // Validaciones - RELAJADAS para edición
  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case 'nombres_cliente':
        if (!value.trim()) {
          newErrors.nombres_cliente = 'Los nombres son obligatorios'
        } else if (value.length < 2) {
          newErrors.nombres_cliente = 'Los nombres deben tener al menos 2 caracteres'
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
          newErrors.nombres_cliente = 'Los nombres solo pueden contener letras y espacios'
        } else {
          delete newErrors.nombres_cliente
        }
        break

      case 'apellidos_cliente':
        if (!value.trim()) {
          newErrors.apellidos_cliente = 'Los apellidos son obligatorios'
        } else if (value.length < 2) {
          newErrors.apellidos_cliente = 'Los apellidos deben tener al menos 2 caracteres'
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
          newErrors.apellidos_cliente = 'Los apellidos solo pueden contener letras y espacios'
        } else {
          delete newErrors.apellidos_cliente
        }
        break

      case 'identidad':
        if (!value.trim()) {
          newErrors.identidad = 'La identidad/documento es obligatoria'
        } else if (!/^[0-9-]+$/.test(value)) {
          newErrors.identidad = 'La identidad solo puede contener números y guiones'
        } else if (value.replace(/-/g, '').length < 8) {
          newErrors.identidad = 'La identidad debe tener al menos 8 dígitos'
        } else {
          delete newErrors.identidad
        }
        break

      case 'telefono':
        if (value && !/^[0-9+\-\s()]+$/.test(value)) {
          newErrors.telefono = 'Formato de teléfono inválido'
        } else if (value && value.replace(/[^0-9]/g, '').length < 8) {
          newErrors.telefono = 'El teléfono debe tener al menos 8 dígitos'
        } else {
          delete newErrors.telefono
        }
        break

      case 'correo':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.correo = 'Formato de correo electrónico inválido'
        } else {
          delete newErrors.correo
        }
        break

      case 'id_tipo_cliente':
        if (!value) {
          newErrors.id_tipo_cliente = 'El tipo de cliente es obligatorio'
        } else {
          delete newErrors.id_tipo_cliente
        }
        break

      case 'direccion':
        if (value && value.length < 5) {
          newErrors.direccion = 'La dirección debe tener al menos 5 caracteres'
        } else {
          delete newErrors.direccion
        }
        break

      default:
        break
    }

    return newErrors
  }

  // Validar todo el formulario - RELAJADA para edición
  const validateForm = () => {
    const newErrors = {}

    // Validar campos obligatorios
    if (!localFormData.nombres_cliente?.trim()) {
      newErrors.nombres_cliente = 'Los nombres son obligatorios'
    } else if (localFormData.nombres_cliente.length < 2) {
      newErrors.nombres_cliente = 'Los nombres deben tener al menos 2 caracteres'
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(localFormData.nombres_cliente)) {
      newErrors.nombres_cliente = 'Los nombres solo pueden contener letras y espacios'
    }

    if (!localFormData.apellidos_cliente?.trim()) {
      newErrors.apellidos_cliente = 'Los apellidos son obligatorios'
    } else if (localFormData.apellidos_cliente.length < 2) {
      newErrors.apellidos_cliente = 'Los apellidos deben tener al menos 2 caracteres'
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(localFormData.apellidos_cliente)) {
      newErrors.apellidos_cliente = 'Los apellidos solo pueden contener letras y espacios'
    }

    if (!localFormData.identidad?.trim()) {
      newErrors.identidad = 'La identidad/documento es obligatoria'
    } else if (!/^[0-9-]+$/.test(localFormData.identidad)) {
      newErrors.identidad = 'La identidad solo puede contener números y guiones'
    } else if (localFormData.identidad.replace(/-/g, '').length < 8) {
      newErrors.identidad = 'La identidad debe tener al menos 8 dígitos'
    }

    if (!localFormData.id_tipo_cliente) {
      newErrors.id_tipo_cliente = 'El tipo de cliente es obligatorio'
    }

    // Validar campos opcionales
    if (localFormData.telefono && !/^[0-9+\-\s()]+$/.test(localFormData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido'
    } else if (localFormData.telefono && localFormData.telefono.replace(/[^0-9]/g, '').length < 8) {
      newErrors.telefono = 'El teléfono debe tener al menos 8 dígitos'
    }

    if (localFormData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localFormData.correo)) {
      newErrors.correo = 'Formato de correo electrónico inválido'
    }

    if (localFormData.direccion && localFormData.direccion.length < 5) {
      newErrors.direccion = 'La dirección debe tener al menos 5 caracteres'
    }

    return newErrors
  }

  // Manejar blur de campos
  const handleBlur = (e) => {
    const { name, value } = e.target
    
    // Convertir a mayúsculas al salir del campo (solo nombres y apellidos)
    if ((name === 'nombres_cliente' || name === 'apellidos_cliente') && value) {
      const processedValue = value.toUpperCase()
      const updatedFormData = {
        ...localFormData,
        [name]: processedValue
      }
      setLocalFormData(updatedFormData)
      
      onChange({
        target: {
          name: name,
          value: processedValue
        }
      })
    }
    
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Asegurar que nombres y apellidos estén en mayúsculas antes de enviar
    const finalFormData = {
      ...localFormData,
      nombres_cliente: localFormData.nombres_cliente?.toUpperCase() || '',
      apellidos_cliente: localFormData.apellidos_cliente?.toUpperCase() || ''
    }
    
    // Actualizar el estado local con los valores finales
    setLocalFormData(finalFormData)
    
    // Marcar todos los campos como tocados
    const allTouched = {}
    Object.keys(finalFormData).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)

    // Validar todo el formulario
    const formErrors = validateForm()
    setErrors(formErrors)

    // Si no hay errores, enviar el formulario
    if (Object.keys(formErrors).length === 0) {
      // Actualizar el formData del padre con los valores finales
      Object.keys(finalFormData).forEach(key => {
        onChange({
          target: {
            name: key,
            value: finalFormData[key]
          }
        })
      })
      onSubmit(e)
    }
  }

  // Limpiar errores al cerrar el modal
  useEffect(() => {
    if (!show) {
      setErrors({})
      setTouched({})
      setLocalFormData({
        nombres_cliente: '',
        apellidos_cliente: '',
        identidad: '',
        direccion: '',
        telefono: '',
        correo: '',
        id_tipo_cliente: '',
      })
    }
  }, [show])

  const hasErrors = Object.keys(errors).length > 0

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {editId !== null ? 'Editar Cliente' : 'Registrar Cliente'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {hasErrors && Object.keys(touched).length > 0 && (
          <Alert variant="warning" className="mb-3">
            Por favor corrige los errores en el formulario antes de continuar.
          </Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres_cliente"
                value={localFormData.nombres_cliente || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                isInvalid={touched.nombres_cliente && errors.nombres_cliente}
                isValid={touched.nombres_cliente && !errors.nombres_cliente}
                style={{ textTransform: 'uppercase' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.nombres_cliente}
              </Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                name="apellidos_cliente"
                value={localFormData.apellidos_cliente || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                isInvalid={touched.apellidos_cliente && errors.apellidos_cliente}
                isValid={touched.apellidos_cliente && !errors.apellidos_cliente}
                style={{ textTransform: 'uppercase' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.apellidos_cliente}
              </Form.Control.Feedback>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Identidad *</Form.Label>
              <Form.Control
                type="text"
                name="identidad"
                value={localFormData.identidad || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                isInvalid={touched.identidad && errors.identidad}
                isValid={touched.identidad && !errors.identidad}
                placeholder="Ej: 0801-1990-12345"
              />
              <Form.Control.Feedback type="invalid">
                {errors.identidad}
              </Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                value={localFormData.telefono || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                isInvalid={touched.telefono && errors.telefono}
                isValid={touched.telefono && !errors.telefono && localFormData.telefono}
              />
              <Form.Control.Feedback type="invalid">
                {errors.telefono}
              </Form.Control.Feedback>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={localFormData.correo || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                isInvalid={touched.correo && errors.correo}
                isValid={touched.correo && !errors.correo && localFormData.correo}
                placeholder="ejemplo@correo.com"
              />
              <Form.Control.Feedback type="invalid">
                {errors.correo}
              </Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Tipo de Cliente</Form.Label>
              <Form.Select
                name="id_tipo_cliente"
                value={localFormData.id_tipo_cliente || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                isInvalid={touched.id_tipo_cliente && errors.id_tipo_cliente}
                isValid={touched.id_tipo_cliente && !errors.id_tipo_cliente}
              >
                {tiposClientes.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.id_tipo_cliente}
              </Form.Control.Feedback>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={localFormData.direccion || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                isInvalid={touched.direccion && errors.direccion}
                isValid={touched.direccion && !errors.direccion && localFormData.direccion}
                placeholder="Ej: Colonia Los Pinos, Calle Principal #123"
              />
              <Form.Control.Feedback type="invalid">
                {errors.direccion}
              </Form.Control.Feedback>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || (hasErrors && Object.keys(touched).length > 0)}
            >
              {loading ? 'Guardando...' : (editId !== null ? 'Actualizar Cliente' : 'Guardar Cliente')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default ClienteModal