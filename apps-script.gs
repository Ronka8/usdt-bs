/**
 * BACKEND CRUD para la app "Registro USDT · Bs".
 *
 * INSTALACIÓN:
 * 1) Crea o abre el Google Sheet que servirá de base de datos.
 * 2) Ve a Extensiones > Apps Script.
 * 3) Borra el contenido de Code.gs y pega todo este archivo.
 * 4) Clic en "Implementar" > "Nueva implementación".
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier usuario
 * 5) Copia el "URL de la aplicación web" (termina en /exec) y pégala en
 *    Ajustes de la app, en "URL de Google Apps Script (Web App)".
 * 6) Cada dispositivo que use la MISMA url comparte los mismos registros.
 *
 * Si más adelante modificas este script, debes crear una "Nueva implementación"
 * otra vez (o editar la implementación existente) para que los cambios tomen
 * efecto en la URL que ya está usando la app.
 */

var HEADERS = ['ID','Tipo','USDT','Tasa','Bs','Comision','CantidadLiberada',
               'NumeroOrden','Plataforma','Fecha','Zona','TzOffset','Usuario',
               'Banco','UpdatedAt','Deleted'];

function getSheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Registros');
  if(!sheet){
    sheet = ss.insertSheet('Registros');
  }
  if(sheet.getLastRow() === 0){
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function respond(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Listar todos los registros (incluye los marcados como eliminados,
// para que cada dispositivo pueda sincronizar la eliminación).
function doGet(e){
  var sheet = getSheet();
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var records = [];
  for(var i=1;i<values.length;i++){
    var row = values[i];
    if(!row[0]) continue;
    var rec = {};
    for(var c=0;c<headers.length;c++){ rec[headers[c]] = row[c]; }
    records.push({
      id: String(rec.ID),
      tipo: rec.Tipo,
      usdt: rec.USDT,
      tasa: rec.Tasa,
      bs: rec.Bs,
      comision: rec.Comision,
      cantidadLiberada: rec.CantidadLiberada,
      numeroOrden: rec.NumeroOrden,
      plataforma: rec.Plataforma,
      fecha: rec.Fecha,
      zona: rec.Zona,
      tzOffset: rec.TzOffset,
      usuario: rec.Usuario,
      banco: rec.Banco,
      updatedAt: rec.UpdatedAt,
      deleted: rec.Deleted === true || rec.Deleted === 'TRUE' || rec.Deleted === 'true'
    });
  }
  return respond({records: records});
}

// Crear, actualizar (upsert) o eliminar (borrado suave) un registro.
function doPost(e){
  var sheet = getSheet();
  var body = JSON.parse(e.postData.contents);
  var action = body.action;
  var record = body.record || {};
  var id = String(record.id || '');
  if(!id){ return respond({status:'error', message:'missing id'}); }

  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for(var i=1;i<data.length;i++){
    if(String(data[i][0]) === id){ rowIndex = i+1; break; }
  }
  var now = record.updatedAt || Date.now();

  if(action === 'delete'){
    if(rowIndex > 0){
      sheet.deleteRow(rowIndex); // Borra toda la fila físicamente de la hoja
    }
    return respond({status:'ok'});
  }

  var rowValues = HEADERS.map(function(h){
    switch(h){
      case 'ID': return id;
      case 'Tipo': return record.tipo || '';
      case 'USDT': return record.usdt || 0;
      case 'Tasa': return record.tasa || 0;
      case 'Bs': return record.bs || 0;
      case 'Comision': return record.comision || 0;
      case 'CantidadLiberada': return record.cantidadLiberada || 0;
      case 'NumeroOrden': return record.numeroOrden || '';
      case 'Plataforma': return record.plataforma || '';
      case 'Fecha': return record.fecha || '';
      case 'Zona': return record.zona || '';
      case 'TzOffset': return record.tzOffset || '';
      case 'Usuario': return record.usuario || '';
      case 'Banco': return record.banco || '';
      case 'UpdatedAt': return now;
      case 'Deleted': return !!record.deleted;
      default: return '';
    }
  });

  if(rowIndex > 0){
    sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  return respond({status:'ok', id: id, updatedAt: now});
}
