const { v4: uuidv4 } = require('uuid');

class Ticket {
  constructor(id, usuario, descripcion, prioridad, estado = 'Abierto', tecnicoAsignado = null, fechaCreacion = new Date()) {
    this._id = id || uuidv4();
    this._usuario = usuario;
    this._descripcion = descripcion;
    this._prioridad = prioridad;
    this._estado = estado;
    this._tecnicoAsignado = tecnicoAsignado;
    this._fechaCreacion = fechaCreacion;
    this._fechaActualizacion = new Date();
    this._validar();
  }

  _validar() {
    const errores = [];
    
    if (!this._usuario || this._usuario.trim() === '') {
      errores.push('Usuario es requerido');
    }
    
    if (!this._descripcion || this._descripcion.trim() === '') {
      errores.push('Descripción es requerida');
    }
    
    const prioridadesValidas = ['Baja', 'Media', 'Alta', 'Crítica'];
    if (!this._prioridad || !prioridadesValidas.includes(this._prioridad)) {
      errores.push(`Prioridad inválida. Debe ser: ${prioridadesValidas.join(', ')}`);
    }
    
    const estadosValidos = ['Abierto', 'En Progreso', 'En Espera', 'Resuelto', 'Cerrado'];
    if (!this._estado || !estadosValidos.includes(this._estado)) {
      errores.push(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`);
    }

    if (errores.length > 0) {
      throw new Error(`Errores de validación: ${errores.join(', ')}`);
    }
  }

  // Getters
  get id() { return this._id; }
  get usuario() { return this._usuario; }
  get descripcion() { return this._descripcion; }
  get prioridad() { return this._prioridad; }
  get estado() { return this._estado; }
  get tecnicoAsignado() { return this._tecnicoAsignado; }
  get fechaCreacion() { return this._fechaCreacion; }
  get fechaActualizacion() { return this._fechaActualizacion; }

  // Métodos de dominio
  asignarTecnico(tecnico) {
    if (this._estado === 'Cerrado') {
      throw new Error('No se puede asignar técnico a un ticket cerrado');
    }
    this._tecnicoAsignado = tecnico;
    this._estado = 'En Progreso';
    this._fechaActualizacion = new Date();
  }

  actualizarEstado(nuevoEstado) {
    const estadosValidos = ['Abierto', 'En Progreso', 'En Espera', 'Resuelto', 'Cerrado'];
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`);
    }
    
    if (this._estado === 'Cerrado' && nuevoEstado !== 'Cerrado') {
      throw new Error('No se puede reabrir un ticket cerrado');
    }
    
    this._estado = nuevoEstado;
    this._fechaActualizacion = new Date();
  }

  actualizarDescripcion(nuevaDescripcion) {
    if (!nuevaDescripcion || nuevaDescripcion.trim() === '') {
      throw new Error('La descripción no puede estar vacía');
    }
    this._descripcion = nuevaDescripcion;
    this._fechaActualizacion = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      usuario: this._usuario,
      descripcion: this._descripcion,
      prioridad: this._prioridad,
      estado: this._estado,
      tecnicoAsignado: this._tecnicoAsignado,
      fechaCreacion: this._fechaCreacion,
      fechaActualizacion: this._fechaActualizacion
    };
  }

  static fromData(data) {
    return new Ticket(
      data.id,
      data.usuario,
      data.descripcion,
      data.prioridad,
      data.estado,
      data.tecnico_asignado,
      data.fecha_creacion
    );
  }
}

module.exports = Ticket;