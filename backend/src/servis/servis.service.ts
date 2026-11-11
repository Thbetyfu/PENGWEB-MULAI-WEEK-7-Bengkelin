import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateServisDto } from './dto/create-servis.dto.js';
import { UpdateServisDto } from './dto/update-servis.dto.js';
import { Servis } from './entities/servis.entity.js';

@Injectable()
export class ServisService {
  // Data disimpan sementara dalam array di memori (in-memory storage)
  private daftarServis: Servis[] = [
    {
      id: 'SRV-101',
      kendaraan: 'Honda Vario 160',
      platNomor: 'D 2341 ABC',
      jenisMotor: 'Konvensional',
      bengkel: 'Bengkel Sentosa Motor',
      layanan: 'Ganti Oli Mesin & Filter',
      biaya: 85000,
      tanggal: '2026-11-10',
      status: 'Selesai',
    },
    {
      id: 'SRV-102',
      kendaraan: 'Gesits Raya G',
      platNomor: 'B 5412 EV',
      jenisMotor: 'Listrik',
      bengkel: 'EV Care Hub Bandung',
      layanan: 'Pemeriksaan BMS & Baterai',
      biaya: 120000,
      tanggal: '2026-11-11',
      status: 'Dijadwalkan',
    },
    {
      id: 'SRV-103',
      kendaraan: 'Yamaha NMAX 155',
      platNomor: 'D 8892 KLG',
      jenisMotor: 'Konvensional',
      bengkel: 'Ahass Prima Motor',
      layanan: 'Servis CVT & Kampas Rem',
      biaya: 175000,
      tanggal: '2026-11-12',
      status: 'Dijadwalkan',
    },
    {
      id: 'SRV-104',
      kendaraan: 'Alva Cervo',
      platNomor: 'B 3108 ELE',
      jenisMotor: 'Listrik',
      bengkel: 'Electra Service Point',
      layanan: 'Pengecekan Motor Hub & Kelistrikan',
      biaya: 150000,
      tanggal: '2026-11-13',
      status: 'Dijadwalkan',
    },
  ];

  constructor() {
    console.log(
      `[Bengkelin API] ServisService siap dengan ${this.daftarServis.length} data awal di memori.`,
    );
  }

  // GET ALL (dengan filter status atau jenisMotor jika disediakan)
  findAll(status?: string, jenisMotor?: string): Servis[] {
    let hasil = this.daftarServis;
    if (status) {
      hasil = hasil.filter(
        (s) => s.status.toLowerCase() === status.toLowerCase(),
      );
    }
    if (jenisMotor) {
      hasil = hasil.filter(
        (s) => s.jenisMotor.toLowerCase() === jenisMotor.toLowerCase(),
      );
    }
    return hasil;
  }

  // GET ONE BY ID
  findOne(id: string): Servis {
    const item = this.daftarServis.find((s) => s.id === id);
    if (!item) {
      throw new NotFoundException(
        `Data servis dengan ID "${id}" tidak ditemukan pada sistem Bengkelin.`,
      );
    }
    return item;
  }

  // CREATE NEW SERVIS
  create(createServisDto: CreateServisDto): Servis {
    // Skenario Error 1: ConflictException jika plat nomor yang sama sudah dijadwalkan pada tanggal yang sama
    const duplikat = this.daftarServis.find(
      (s) =>
        s.platNomor.toLowerCase() === createServisDto.platNomor.toLowerCase() &&
        s.tanggal === createServisDto.tanggal &&
        s.status === 'Dijadwalkan',
    );

    if (duplikat) {
      throw new ConflictException(
        `Jadwal servis untuk kendaraan dengan plat nomor "${createServisDto.platNomor}" pada tanggal ${createServisDto.tanggal} sudah terdaftar.`,
      );
    }

    // Generate ID unik berurutan (misal: SRV-105)
    const nomorBerikutnya =
      this.daftarServis.length > 0
        ? Math.max(
            ...this.daftarServis.map((s) => {
              const num = parseInt(s.id.replace('SRV-', ''), 10);
              return isNaN(num) ? 100 : num;
            }),
          ) + 1
        : 101;

    const idBaru = `SRV-${nomorBerikutnya}`;

    const dataBaru: Servis = {
      id: idBaru,
      kendaraan: createServisDto.kendaraan,
      platNomor: createServisDto.platNomor.toUpperCase(),
      jenisMotor: createServisDto.jenisMotor,
      bengkel: createServisDto.bengkel,
      layanan: createServisDto.layanan,
      biaya: createServisDto.biaya,
      tanggal: createServisDto.tanggal,
      status: createServisDto.status ?? 'Dijadwalkan',
    };

    this.daftarServis.unshift(dataBaru);
    return dataBaru;
  }

  // UPDATE BY ID
  update(id: string, updateServisDto: UpdateServisDto): Servis {
    const servis = this.findOne(id); // Otomatis lempar NotFoundException jika tidak ada

    if (updateServisDto.platNomor) {
      updateServisDto.platNomor = updateServisDto.platNomor.toUpperCase();
    }

    Object.assign(servis, updateServisDto);
    return servis;
  }

  // REMOVE BY ID
  remove(id: string): { message: string; id: string } {
    const index = this.daftarServis.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(
        `Data servis dengan ID "${id}" tidak ditemukan untuk dihapus.`,
      );
    }
    this.daftarServis.splice(index, 1);
    return {
      message: `Data servis dengan ID "${id}" berhasil dihapus dari sistem Bengkelin.`,
      id,
    };
  }
}
