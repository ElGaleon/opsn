from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain import models


MONTH_NAMES = {
    1: "gennaio",
    2: "febbraio",
    3: "marzo",
    4: "aprile",
    5: "maggio",
    6: "giugno",
    7: "luglio",
    8: "agosto",
}


def money(amount: Decimal) -> Decimal:
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def add_shares(db: Session, target, shares: list[tuple[models.Owner, str]], valid_from: date) -> None:
    db.add_all(
        models.OwnershipShare(
            owner=owner,
            property=target if isinstance(target, models.Property) else None,
            unit=target if isinstance(target, models.Unit) else None,
            percentage=Decimal(percentage),
            valid_from=valid_from,
        )
        for owner, percentage in shares
    )


def add_movement(
    db: Session,
    *,
    owners: list[tuple[models.Owner, str]],
    amount: str,
    **fields,
) -> models.Movement:
    movement = models.Movement(amount=Decimal(amount), **fields)
    db.add(movement)
    db.flush()
    db.add_all(
        models.MovementAllocation(
            movement=movement,
            owner=owner,
            percentage=Decimal(percentage),
            amount=money(movement.amount * Decimal(percentage) / 100),
        )
        for owner, percentage in owners
    )
    return movement


def seed(db: Session) -> None:
    if db.scalar(select(models.Owner.id)):
        return

    mario = models.Owner(
        first_name="Mario",
        last_name="Rossi",
        tax_code="RSSMRA70A01H501U",
        contacts="mario.rossi@example.test | +39 333 111 2233",
    )
    anna = models.Owner(
        first_name="Anna",
        last_name="Rossi",
        tax_code="RSSNNA72B41H501W",
        contacts="anna.rossi@example.test | +39 333 444 5566",
    )
    giulia = models.Owner(
        first_name="Giulia",
        last_name="Verdi",
        tax_code="VRDGLI85C52F205Z",
        contacts="giulia.verdi@example.test | +39 347 888 9900",
    )
    db.add_all([mario, anna, giulia])

    roma = models.Property(
        name="Palazzina Via Roma",
        address="Via Roma 12, Milano",
        street="Via Roma",
        street_number="12",
        city="Milano",
        postal_code="20121",
        province="MI",
        region="Lombardia",
        country="Italia",
        latitude=Decimal("45.464664"),
        longitude=Decimal("9.188540"),
        purchase_value=Decimal("520000"),
        mortgage=Decimal("210000"),
        condo_fees=Decimal("360"),
        notes="Immobile principale con due appartamenti e un box.",
    )
    torino = models.Property(
        name="Residenza San Paolo",
        address="Corso Racconigi 88, Torino",
        street="Corso Racconigi",
        street_number="88",
        city="Torino",
        postal_code="10139",
        province="TO",
        region="Piemonte",
        country="Italia",
        latitude=Decimal("45.064920"),
        longitude=Decimal("7.649830"),
        purchase_value=Decimal("310000"),
        mortgage=Decimal("95000"),
        condo_fees=Decimal("220"),
        notes="Una unita locata a studenti e un negozio al piano strada.",
    )
    mare = models.Property(
        name="Casa Mare Pineta",
        address="Via della Pineta 4, Spotorno",
        street="Via della Pineta",
        street_number="4",
        city="Spotorno",
        postal_code="17028",
        province="SV",
        region="Liguria",
        country="Italia",
        latitude=Decimal("44.227410"),
        longitude=Decimal("8.417760"),
        purchase_value=Decimal("240000"),
        mortgage=Decimal("0"),
        condo_fees=Decimal("140"),
        notes="Casa vacanze, locazioni brevi solo in alta stagione.",
    )
    db.add_all([roma, torino, mare])

    roma_a1 = models.Unit(property=roma, name="Appartamento A1", unit_type=models.UnitType.apartment)
    roma_a2 = models.Unit(property=roma, name="Appartamento A2", unit_type=models.UnitType.apartment)
    roma_box = models.Unit(property=roma, name="Box 3", unit_type=models.UnitType.garage)
    torino_b1 = models.Unit(property=torino, name="Bilocale B1", unit_type=models.UnitType.apartment)
    torino_shop = models.Unit(property=torino, name="Negozio 1", unit_type=models.UnitType.commercial)
    mare_c1 = models.Unit(property=mare, name="Appartamento C1", unit_type=models.UnitType.apartment)
    db.add_all([roma_a1, roma_a2, roma_box, torino_b1, torino_shop, mare_c1])
    db.flush()

    family_shares = [(mario, "50"), (anna, "30"), (giulia, "20")]
    torino_shares = [(anna, "60"), (giulia, "40")]
    mario_shares = [(mario, "100")]
    for target in [roma, roma_a1, roma_a2, roma_box]:
        add_shares(db, target, family_shares, date(2024, 1, 1))
    for target in [torino, torino_b1, torino_shop]:
        add_shares(db, target, torino_shares, date(2025, 1, 1))
    for target in [mare, mare_c1]:
        add_shares(db, target, mario_shares, date(2023, 6, 1))

    luca = models.Tenant(full_name="Luca Bianchi", tax_code="BNCLCU90A01F205K", contacts="luca.bianchi@example.test | +39 333 222 1100")
    sara = models.Tenant(full_name="Sara Neri", tax_code="NRESRA88B41F205X", contacts="sara.neri@example.test | +39 333 555 7788")
    marco_elena = models.Tenant(full_name="Marco Conti e Elena Ferri", contacts="marco.elena@example.test | +39 347 333 2211")
    studio_blu = models.Tenant(full_name="Studio Blu Srl", tax_code="12345678901", contacts="amministrazione@studioblu.example.test")
    db.add_all([luca, sara, marco_elena, studio_blu])
    db.flush()

    contracts = [
        models.LeaseContract(
            unit=roma_a1,
            tenant=luca,
            starts_on=date(2026, 1, 1),
            ends_on=date(2029, 12, 31),
            monthly_rent=Decimal("980"),
            deposit=Decimal("1960"),
            due_day=5,
            istat_adjustment=True,
        ),
        models.LeaseContract(
            unit=roma_a2,
            tenant=sara,
            starts_on=date(2025, 9, 1),
            ends_on=None,
            monthly_rent=Decimal("1120"),
            deposit=Decimal("2240"),
            due_day=3,
            istat_adjustment=True,
        ),
        models.LeaseContract(
            unit=torino_b1,
            tenant=marco_elena,
            starts_on=date(2026, 2, 1),
            ends_on=date(2027, 1, 31),
            monthly_rent=Decimal("760"),
            deposit=Decimal("1520"),
            due_day=7,
            istat_adjustment=False,
        ),
        models.LeaseContract(
            unit=torino_shop,
            tenant=studio_blu,
            starts_on=date(2024, 4, 1),
            ends_on=date(2030, 3, 31),
            monthly_rent=Decimal("1450"),
            deposit=Decimal("4350"),
            due_day=10,
            istat_adjustment=True,
        ),
    ]
    db.add_all(contracts)
    db.flush()

    rent_rows = [
        (contracts[0], roma, roma_a1, family_shares, anna, "980"),
        (contracts[1], roma, roma_a2, family_shares, anna, "1120"),
        (contracts[2], torino, torino_b1, torino_shares, giulia, "760"),
        (contracts[3], torino, torino_shop, torino_shares, anna, "1450"),
    ]
    for month in range(1, 9):
        for contract, prop, unit, shares, collector, amount in rent_rows:
            accrual = date(2026, month, 1)
            if contract.starts_on > accrual:
                continue
            status = models.MovementStatus.paid
            payment_date = date(2026, month, min(contract.due_day + 1, 28))
            if contract is contracts[1] and month == 8:
                status = models.MovementStatus.unpaid
                payment_date = None
            elif contract is contracts[2] and month == 7:
                status = models.MovementStatus.partial
                payment_date = date(2026, month, 18)
            add_movement(
                db,
                owners=shares,
                property_id=prop.id,
                unit_id=unit.id,
                contract_id=contract.id,
                type=models.MovementType.income,
                category="Affitto",
                description=f"Canone {MONTH_NAMES[month]} 2026 - {contract.tenant_name}",
                amount=amount,
                accrual_date=accrual,
                due_date=date(2026, month, contract.due_day),
                payment_date=payment_date,
                status=status,
                allocation_mode=models.AllocationMode.ownership,
                paid_by_owner_id=collector.id if status != models.MovementStatus.unpaid else None,
                payment_method="bonifico" if status != models.MovementStatus.unpaid else None,
            )

        add_movement(
            db,
            owners=family_shares,
            property_id=roma.id,
            unit_id=None,
            contract_id=None,
            type=models.MovementType.expense,
            category="Mutuo",
            description=f"Rata mutuo Via Roma {MONTH_NAMES[month]} 2026",
            amount="820",
            accrual_date=date(2026, month, 12),
            due_date=date(2026, month, 12),
            payment_date=date(2026, month, 12),
            status=models.MovementStatus.paid,
            allocation_mode=models.AllocationMode.ownership,
            paid_by_owner_id=mario.id,
            payment_method="RID",
        )
        add_movement(
            db,
            owners=torino_shares,
            property_id=torino.id,
            unit_id=None,
            contract_id=None,
            type=models.MovementType.expense,
            category="Mutuo",
            description=f"Rata mutuo Torino {MONTH_NAMES[month]} 2026",
            amount="430",
            accrual_date=date(2026, month, 15),
            due_date=date(2026, month, 15),
            payment_date=date(2026, month, 15),
            status=models.MovementStatus.paid,
            allocation_mode=models.AllocationMode.ownership,
            paid_by_owner_id=anna.id,
            payment_method="RID",
        )

    extra_movements = [
        (family_shares, roma, None, "Manutenzione", "Riparazione caldaia condominiale", "900", date(2026, 2, 18), mario, "bonifico", models.MovementStatus.paid),
        (family_shares, roma, None, "Assicurazione", "Polizza fabbricato annuale", "1240", date(2026, 3, 10), anna, "bonifico", models.MovementStatus.paid),
        (torino_shares, torino, None, "Condominio", "Acconto spese condominiali Q1", "610", date(2026, 3, 20), anna, "bonifico", models.MovementStatus.paid),
        (torino_shares, torino, None, "Condominio", "Acconto spese condominiali Q2", "640", date(2026, 6, 20), giulia, "bonifico", models.MovementStatus.paid),
        (torino_shares, torino, None, "Condominio", "Acconto spese condominiali Q3", "660", date(2026, 7, 20), None, None, models.MovementStatus.unpaid),
        ([(mario, "70"), (anna, "30")], mare, mare_c1, "Utenze", "Energia elettrica casa mare", "184.75", date(2026, 8, 6), mario, "RID", models.MovementStatus.paid),
    ]
    for shares, prop, unit, category, description, amount, day, payer, method, status in extra_movements:
        add_movement(
            db,
            owners=shares,
            property_id=prop.id,
            unit_id=unit.id if unit else None,
            contract_id=None,
            type=models.MovementType.expense,
            category=category,
            description=description,
            amount=amount,
            accrual_date=day,
            due_date=day,
            payment_date=day if status != models.MovementStatus.unpaid else None,
            status=status,
            allocation_mode=models.AllocationMode.custom if category == "Utenze" else models.AllocationMode.ownership,
            paid_by_owner_id=payer.id if payer else None,
            payment_method=method,
        )
    for month, amount in [(6, "820"), (7, "1180"), (8, "1350")]:
        add_movement(
            db,
            owners=mario_shares,
            property_id=mare.id,
            unit_id=mare_c1.id,
            contract_id=None,
            type=models.MovementType.income,
            category="Locazione breve",
            description=f"Soggiorni brevi {MONTH_NAMES[month]} 2026",
            amount=amount,
            accrual_date=date(2026, month, 12),
            due_date=date(2026, month, 12),
            payment_date=date(2026, month, 12),
            status=models.MovementStatus.paid,
            allocation_mode=models.AllocationMode.ownership,
            paid_by_owner_id=mario.id,
            payment_method="carta",
        )
    db.add(
        models.Movement(
            property_id=None,
            unit_id=None,
            contract_id=None,
            type=models.MovementType.transfer,
            category="Giroconto proprietari",
            description="Rimborso Anna a Mario per manutenzione",
            amount=Decimal("270"),
            accrual_date=date(2026, 8, 18),
            due_date=date(2026, 8, 18),
            payment_date=date(2026, 8, 18),
            status=models.MovementStatus.paid,
            allocation_mode=models.AllocationMode.owner,
            paid_by_owner_id=anna.id,
            transfer_to_owner_id=mario.id,
            payment_method="bonifico",
        )
    )
    db.add(
        models.OwnerTransfer(
            from_owner_id=giulia.id,
            to_owner_id=anna.id,
            amount=Decimal("180"),
            transfer_date=date(2026, 8, 21),
            method="bonifico",
            notes="Conguaglio incasso parziale Torino B1.",
        )
    )
    db.add_all(
        [
            models.Deadline(title="Rinnovo assicurazione fabbricato", due_date=date(2026, 9, 15), property_id=roma.id),
            models.Deadline(title="Registrazione annualita contratto A2", due_date=date(2026, 9, 30), property_id=roma.id, unit_id=roma_a2.id),
            models.Deadline(title="Sollecito saldo canone studenti", due_date=date(2026, 8, 28), property_id=torino.id, unit_id=torino_b1.id),
            models.Deadline(title="Verifica estintori negozio", due_date=date(2026, 10, 10), property_id=torino.id, unit_id=torino_shop.id),
            models.Deadline(title="Saldo TARI casa mare", due_date=date(2026, 12, 2), property_id=mare.id, status="open"),
            models.Deadline(title="Voltura energia casa mare completata", due_date=date(2026, 7, 12), property_id=mare.id, status="done"),
        ]
    )
    db.commit()
