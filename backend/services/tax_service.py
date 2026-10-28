"""
Tax Optimization & Compliance Engine (Indian Income Tax Act)
Evaluates Old Tax Regime vs New Tax Regime (Section 115BAC, updated as per Finance Act 2024 / FY 2024-25).
"""
from typing import Dict, Any


class TaxService:
    @classmethod
    def calculate_old_regime(
        cls,
        gross_income: float,
        sec_80c: float = 0.0,
        sec_80d: float = 0.0,
        hra: float = 0.0,
        home_loan_interest_24b: float = 0.0,
        nps_80ccd_1b: float = 0.0,
        other_exemptions: float = 0.0,
        is_salaried: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates tax under Old Regime with standard deduction & Chapter VI-A deductions.
        """
        std_deduction = 50000.0 if is_salaried else 0.0

        capped_80c = min(max(0.0, float(sec_80c)), 150000.0)
        capped_80d = min(max(0.0, float(sec_80d)), 75000.0)
        capped_24b = min(max(0.0, float(home_loan_interest_24b)), 200000.0)
        capped_nps = min(max(0.0, float(nps_80ccd_1b)), 50000.0)
        hra_exemption = max(0.0, float(hra))

        total_deductions = (
            std_deduction +
            capped_80c +
            capped_80d +
            capped_24b +
            capped_nps +
            hra_exemption +
            max(0.0, float(other_exemptions))
        )

        taxable_income = max(0.0, gross_income - total_deductions)

        # Old Regime Slabs:
        # Up to 2.5L: Nil
        # 2.5L - 5L: 5%
        # 5L - 10L: 20%
        # Above 10L: 30%
        base_tax = 0.0
        slab_breakdown = []

        if taxable_income > 1000000.0:
            tax_30 = (taxable_income - 1000000.0) * 0.30
            base_tax += tax_30
            slab_breakdown.append({"slab": "Above ₹10,00,000 (30%)", "tax": round(tax_30, 2)})

        if taxable_income > 500000.0:
            taxable_20 = min(taxable_income - 500000.0, 500000.0)
            tax_20 = taxable_20 * 0.20
            base_tax += tax_20
            slab_breakdown.append({"slab": "₹5,00,001 - ₹10,00,000 (20%)", "tax": round(tax_20, 2)})

        if taxable_income > 250000.0:
            taxable_5 = min(taxable_income - 250000.0, 250000.0)
            tax_5 = taxable_5 * 0.05
            base_tax += tax_5
            slab_breakdown.append({"slab": "₹2,50,001 - ₹5,00,000 (5%)", "tax": round(tax_5, 2)})

        # Section 87A rebate: if taxable income <= 5L, rebate up to ₹12,500
        rebate_87a = 0.0
        if taxable_income <= 500000.0 and base_tax > 0:
            rebate_87a = min(base_tax, 12500.0)
            base_tax -= rebate_87a

        cess = base_tax * 0.04
        total_tax = round(base_tax + cess, 2)

        return {
            "gross_income": gross_income,
            "standard_deduction": std_deduction,
            "deductions": {
                "section_80c": capped_80c,
                "section_80d": capped_80d,
                "home_loan_interest_24b": capped_24b,
                "nps_80ccd_1b": capped_nps,
                "hra_exemption": hra_exemption,
                "other_exemptions": max(0.0, float(other_exemptions)),
                "total_deductions": total_deductions
            },
            "taxable_income": taxable_income,
            "base_tax": round(base_tax, 2),
            "rebate_87a": round(rebate_87a, 2),
            "cess_4_pct": round(cess, 2),
            "total_tax": total_tax,
            "effective_tax_rate": round((total_tax / gross_income * 100), 2) if gross_income > 0 else 0.0,
            "slab_breakdown": slab_breakdown
        }

    @classmethod
    def calculate_new_regime(
        cls,
        gross_income: float,
        is_salaried: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates tax under New Regime (Sec 115BAC, FY 2024-25 / Budget 2024 slabs).
        Standard deduction for salaried: ₹75,000
        Slabs:
          0 - 3L: Nil
          3L - 7L: 5%
          7L - 10L: 10%
          10L - 12L: 15%
          12L - 15L: 20%
          Above 15L: 30%
        Rebate 87A: Nil tax if taxable income <= 7,00,000 (rebate up to ₹25,000).
        """
        std_deduction = 75000.0 if is_salaried else 0.0
        taxable_income = max(0.0, gross_income - std_deduction)

        base_tax = 0.0
        slab_breakdown = []

        if taxable_income > 1500000.0:
            tax_30 = (taxable_income - 1500000.0) * 0.30
            base_tax += tax_30
            slab_breakdown.append({"slab": "Above ₹15,00,000 (30%)", "tax": round(tax_30, 2)})

        if taxable_income > 1200000.0:
            taxable_20 = min(taxable_income - 1200000.0, 300000.0)
            tax_20 = taxable_20 * 0.20
            base_tax += tax_20
            slab_breakdown.append({"slab": "₹12,00,001 - ₹15,00,000 (20%)", "tax": round(tax_20, 2)})

        if taxable_income > 1000000.0:
            taxable_15 = min(taxable_income - 1000000.0, 200000.0)
            tax_15 = taxable_15 * 0.15
            base_tax += tax_15
            slab_breakdown.append({"slab": "₹10,00,001 - ₹12,00,000 (15%)", "tax": round(tax_15, 2)})

        if taxable_income > 700000.0:
            taxable_10 = min(taxable_income - 700000.0, 300000.0)
            tax_10 = taxable_10 * 0.10
            base_tax += tax_10
            slab_breakdown.append({"slab": "₹7,00,001 - ₹10,00,000 (10%)", "tax": round(tax_10, 2)})

        if taxable_income > 300000.0:
            taxable_5 = min(taxable_income - 300000.0, 400000.0)
            tax_5 = taxable_5 * 0.05
            base_tax += tax_5
            slab_breakdown.append({"slab": "₹3,00,001 - ₹7,00,000 (5%)", "tax": round(tax_5, 2)})

        # Sec 87A rebate for New Regime: if taxable income <= 7L, full rebate (up to 25k)
        rebate_87a = 0.0
        if taxable_income <= 700000.0 and base_tax > 0:
            rebate_87a = min(base_tax, 25000.0)
            base_tax -= rebate_87a

        cess = base_tax * 0.04
        total_tax = round(base_tax + cess, 2)

        return {
            "gross_income": gross_income,
            "standard_deduction": std_deduction,
            "taxable_income": taxable_income,
            "base_tax": round(base_tax, 2),
            "rebate_87a": round(rebate_87a, 2),
            "cess_4_pct": round(cess, 2),
            "total_tax": total_tax,
            "effective_tax_rate": round((total_tax / gross_income * 100), 2) if gross_income > 0 else 0.0,
            "slab_breakdown": slab_breakdown
        }

    @classmethod
    def compare_regimes(cls, **kwargs) -> Dict[str, Any]:
        """
        Executes comparative analysis between Old and New Regime and recommends optimal choice.
        """
        gross_income = float(kwargs.get("gross_income", 0.0))
        is_salaried = bool(kwargs.get("is_salaried", True))

        old_res = cls.calculate_old_regime(
            gross_income=gross_income,
            sec_80c=float(kwargs.get("sec_80c", 0.0)),
            sec_80d=float(kwargs.get("sec_80d", 0.0)),
            hra=float(kwargs.get("hra", 0.0)),
            home_loan_interest_24b=float(kwargs.get("home_loan_interest_24b", 0.0)),
            nps_80ccd_1b=float(kwargs.get("nps_80ccd_1b", 0.0)),
            other_exemptions=float(kwargs.get("other_exemptions", 0.0)),
            is_salaried=is_salaried
        )

        new_res = cls.calculate_new_regime(
            gross_income=gross_income,
            is_salaried=is_salaried
        )

        if new_res["total_tax"] < old_res["total_tax"]:
            recommended = "New Regime"
            savings = round(old_res["total_tax"] - new_res["total_tax"], 2)
            headline = f"New Tax Regime saves you ₹{savings:,.0f} per year."
            reason = (
                f"With lower slab rates and an enhanced ₹75,000 standard deduction, "
                f"the New Regime outperforms your current ₹{old_res['deductions']['total_deductions']:,.0f} Old Regime deductions."
            )
        elif old_res["total_tax"] < new_res["total_tax"]:
            recommended = "Old Regime"
            savings = round(new_res["total_tax"] - old_res["total_tax"], 2)
            headline = f"Old Tax Regime saves you ₹{savings:,.0f} per year."
            reason = (
                f"Your high deductions (₹{old_res['deductions']['total_deductions']:,.0f} across 80C, 80D, HRA & Home Loan) "
                f"reduce your taxable income enough to beat the New Regime."
            )
        else:
            recommended = "Both Equal"
            savings = 0.0
            headline = "Tax liability is identical under both regimes."
            reason = "You pay the same tax in both regimes. New Regime requires zero documentation proof."

        return {
            "success": True,
            "gross_income": gross_income,
            "recommended_regime": recommended,
            "annual_savings": savings,
            "headline": headline,
            "reason": reason,
            "old_regime": old_res,
            "new_regime": new_res
        }

