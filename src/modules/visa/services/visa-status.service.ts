import { BadRequestException, Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';

@Injectable()
export class VisaStatusService {
  ensureCaseActive(isActive: boolean) {
    if (!isActive) throw new BadRequestException('Visa case is closed');
  }

  ensureCanClose(currentStatus: $Enums.VisaCaseStatus) {
    if (currentStatus === $Enums.VisaCaseStatus.CLOSED) throw new BadRequestException('Case already closed');
  }

  statusForMedical(): $Enums.VisaCaseStatus {
    return $Enums.VisaCaseStatus.MEDICAL;
  }

  statusForInsurance(): $Enums.VisaCaseStatus {
    return $Enums.VisaCaseStatus.INSURANCE;
  }

  statusForFingerprint(): $Enums.VisaCaseStatus {
    return $Enums.VisaCaseStatus.FINGERPRINT;
  }

  statusForEmbassy(): $Enums.VisaCaseStatus {
    return $Enums.VisaCaseStatus.EMBASSY;
  }

  statusForLMIS(): $Enums.VisaCaseStatus {
    return $Enums.VisaCaseStatus.LMIS;
  }

  statusForVisaAttempt(): $Enums.VisaCaseStatus {
    return $Enums.VisaCaseStatus.VISA;
  }

  statusForFlightBooking(): $Enums.VisaCaseStatus {
    return $Enums.VisaCaseStatus.FLIGHT_BOOKED;
  }

  statusForReturn(): $Enums.VisaCaseStatus {
    return $Enums.VisaCaseStatus.RETURNED;
  }

  statusForDeployed(): $Enums.VisaCaseStatus {
    return $Enums.VisaCaseStatus.DEPLOYED;
  }

  statusForClosed(): $Enums.VisaCaseStatus {
    return $Enums.VisaCaseStatus.CLOSED;
  }
}
