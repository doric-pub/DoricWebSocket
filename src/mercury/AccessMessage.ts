import Header from './Header'
import Constant from './Constant'
import NextHeaderEnum from './NextHeaderEnum'

export default class AccessMessage {
  flag: number = -1

  version: number = -1

  command: number = -1

  payloadLength: number = -1

  extendHeaders: Array<Header> = new Array<Header>()

  body?: ArrayBuffer

  public encode(): ArrayBuffer {
    if (this.flag == Constant.HEARTBEAT_FLAG) {
      let arrayBuffer = new ArrayBuffer(1)
      let dataView = new DataView(arrayBuffer)

      dataView.setInt8(0, this.flag)

      return arrayBuffer
    } else if (this.flag == Constant.MESSAGE_FLAG) {
      let size = this.estimate()

      let arrayBuffer = new ArrayBuffer(size)
      let dataView = new DataView(arrayBuffer)
      let offset = 0

      dataView.setUint8(offset, this.flag)
      offset += 1

      dataView.setUint8(offset, this.version)
      offset += 1

      dataView.setUint8(offset, this.command)
      offset += 1

      let headerCount = (this.extendHeaders == null ? 0 : this.extendHeaders.length)
      let headerLength = 0
      for (let i = 0; i < headerCount; i++) {
        headerLength += this.extendHeaders[i].calcTotalLength()
      }
      let bodyLength = (this.body == null ? 0 : this.body.byteLength)
      this.payloadLength = headerLength + bodyLength

      dataView.setUint32(offset, this.payloadLength)
      offset += 4

      let nextHeaderType = (headerCount == 0 ? NextHeaderEnum.EMPTY : this.extendHeaders[0].headerType)
      dataView.setUint8(offset, nextHeaderType)
      offset += 1

      for (let i = 0; i < headerCount; i++) {
        nextHeaderType = (i == headerCount - 1 ? NextHeaderEnum.EMPTY : this.extendHeaders[i + 1].headerType)
        dataView.setUint8(offset, nextHeaderType)
        offset += 1

        let curHeader = this.extendHeaders[i]
        let dataLength = curHeader.calcDataLength()

        while (true) {
          let bits = dataLength & 0x7f
          dataLength >>>= 7
          if (dataLength == 0) {
            dataView.setUint8(offset, bits)
            offset += 1
            break
          }
          dataView.setUint8(offset, (bits | 0x80))
          offset += 1
        }

        let tempDataView = new DataView(curHeader.headerData)
        for (let j = 0; j < tempDataView.byteLength; j++) {
          dataView.setUint8(offset, tempDataView.getUint8(j))
          offset += 1
        }
      }

      if (this.body != null) {
        let tempDataView = new DataView(this.body)
        for (let i = 0; i < tempDataView.byteLength; i++) {
          dataView.setUint8(offset, tempDataView.getUint8(i))
          offset += 1
        }
      }

      return arrayBuffer
    }

    return new ArrayBuffer(0)
  }

  private estimate(): number {
    let size = 7

    let headerCount = (this.extendHeaders == null ? 0 : this.extendHeaders.length)
    let nextHeaderType = (headerCount == 0 ? NextHeaderEnum.EMPTY : this.extendHeaders[0].headerType)
    size += 1

    for (let i = 0; i < headerCount; i++) {
      nextHeaderType = (i == headerCount - 1 ? NextHeaderEnum.EMPTY : this.extendHeaders[i + 1].headerType)
      size += 1

      let curHeader = this.extendHeaders[i]
      let dataLength = curHeader.calcDataLength()

      while (true) {
        dataLength >>>= 7
        if (dataLength == 0) {
          size += 1
          break
        }
        size += 1
      }

      let tempDataView = new DataView(curHeader.headerData)
      for (let j = 0; j < tempDataView.byteLength; j++) {
        size += 1
      }
    }

    if (this.body != null) {
      let tempDataView = new DataView(this.body)
      for (let i = 0; i < tempDataView.byteLength; i++) {
        size += 1
      }
    }

    return size
  }

  public decode(arrayBuffer: ArrayBuffer) {
    let dataView = new DataView(arrayBuffer)
    let offset = 0

    this.flag = dataView.getUint8(offset)
    offset += 1

    this.version = dataView.getUint8(offset)
    offset += 1

    this.command = dataView.getUint8(offset)
    offset += 1

    this.payloadLength = dataView.getUint32(offset)
    offset += 4

    let bodyLength = this.payloadLength
    let compressed = false
    let extendHeaders = new Array<Header>()

    let curHeaderType = dataView.getUint8(offset)
    offset++
    while (curHeaderType != NextHeaderEnum.EMPTY) {
      let nextHeaderType = dataView.getUint8(offset)
      offset += 1

      let varintResult = this.getVarInt(dataView, offset)
      let headerLength = varintResult.headerLength
      offset = varintResult.offset

      let tempArrayBuffer = new ArrayBuffer(headerLength)
      let tempDataView = new DataView(tempArrayBuffer)
      for (let index = 0; index < headerLength; index++) {
        let result = dataView.getUint8(offset)
        offset += 1
        tempDataView.setUint8(index, result)
      }
      let header = new Header(curHeaderType, tempArrayBuffer)
      if (curHeaderType == NextHeaderEnum.COMPRESS) {
        compressed = true
      }
      extendHeaders.push(header)
      bodyLength -= header.calcTotalLength()

      curHeaderType = nextHeaderType
    }
    
    this.extendHeaders = extendHeaders
  
    let tempArrayBuffer = new ArrayBuffer(bodyLength)
    let tempDataView = new DataView(tempArrayBuffer)
    for (let index = 0; index < bodyLength; index++) {
      let result = dataView.getUint8(offset)
      offset += 1
      tempDataView.setUint8(index, result)
    }
    
    if (compressed) {
      // TODO
    }
    this.body = tempArrayBuffer
  }

  private getVarInt(dataView: DataView, index: number): { headerLength: number, offset: number} {
    let tmp
    let offset = index
    let r0 = dataView.getUint8(offset)
    offset += 1
    if ((tmp = r0) >= 0) {
      return {
        headerLength: tmp,
        offset: offset
      }
    }
    let result = tmp & 0x7f
    let r1 = dataView.getUint8(offset)
    offset += 1
    if ((tmp = r1) >= 0) {
      result |= tmp << 7
    } else {
      result |= (tmp & 0x7f) << 7
      let r2 = dataView.getUint8(offset)
      offset += 1
      if ((tmp = r2) >= 0) {
        result |= tmp << 14
      } else {
        result |= (tmp & 0x7f) << 14
        let r3 = dataView.getUint8(offset)
        offset += 1
        if ((tmp = r3) >= 0) {
          result |= tmp << 21
        } else {
          result |= (tmp & 0x7f) << 21
          let r4 = dataView.getUint8(offset)
          offset += 1
          result |= (tmp = r4) << 28;
          while (tmp < 0) {
            tmp = dataView.getUint8(offset)
            offset += 1
          }
        }
      }
    }
    return {
      headerLength: result,
      offset: offset
    }
  }
}