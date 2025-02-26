# Copyright © 2023 Province of British Columbia
#
# Licensed under the BSD 3 Clause License, (the "License");
# you may not use this file except in compliance with the License.
# The template for the license can be found here
#    https://opensource.org/license/bsd-3-clause/
#
# Redistribution and use in source and binary forms,
# with or without modification, are permitted provided that the
# following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice,
#    this list of conditions and the following disclaimer.
#
# 2. Redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution.
#
# 3. Neither the name of the copyright holder nor the names of its contributors
#    may be used to endorse or promote products derived from this software
#    without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS”
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
# THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
"""Manages submission data for the BTR filing."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, desc
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sql_versioning import Versioned

from .base import Base
from ..common.enum import auto
from ..common.enum import BaseEnum

if TYPE_CHECKING:
    # https://mypy.readthedocs.io/en/stable/runtime_troubles.html#import-cycles
    from .ownership import Ownership
    from .user import User


class SubmissionType(BaseEnum):
    """Enum of the submission type for a transparency register filing."""

    ANNUAL_FILING = auto()
    CHANGE_FILING = auto()
    INITIAL_FILING = auto()


class Submission(Versioned, Base):
    """Stores a submission of JSON data."""

    __tablename__ = 'submission'

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[SubmissionType] = mapped_column(nullable=True)
    submitted_datetime: Mapped[datetime] = mapped_column()
    submitted_payload = Column(JSONB, nullable=False)
    business_identifier: Mapped[str] = mapped_column(nullable=False, unique=True, index=True)
    # Sync number + status for LEAR filing ledger
    ledger_reference_number: Mapped[uuid.UUID] = mapped_column(nullable=True, unique=True)
    ledger_updated: Mapped[bool] = mapped_column(nullable=False, default=False)

    # Relationships
    ownership_statements: Mapped[list['Ownership']] = relationship(back_populates='submission')

    submitter_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    submitter: Mapped['User'] = relationship(back_populates='submissions')

    @property
    def person_statements_json(self):
        """Return the person statements json linked through this submission's ownership statements."""
        return [ownership.person.person_json for ownership in self.ownership_statements]

    @classmethod
    def find_by_id(cls, submission_id) -> Submission | None:
        """Return the submission by id."""
        return cls.query.filter_by(id=submission_id).one_or_none()

    @classmethod
    def find_by_business_identifier(cls, identifier: str) -> Submission | None:
        """Return the submission by business_identifier."""
        return cls.query.filter_by(business_identifier=identifier).one_or_none()

    @classmethod
    def get_filtered_submissions(cls):
        """Return the submissions."""
        query = cls.query.order_by(desc(Submission.submitted_datetime))
        return query.all()


class SubmissionSerializer:
    """Serializer for submissions. Can convert to dict, string from submission model. """

    @staticmethod
    def to_str(submission: Submission):
        """Return string representation of submission model."""
        return str(SubmissionSerializer.to_dict(submission))

    @staticmethod
    def to_dict(submission: Submission) -> dict:
        """Return the submission class as a dict for response purposes."""

        return {
            'id': submission.id,
            'type': submission.type.value if submission.type else None,
            'submittedDatetime': submission.submitted_datetime.isoformat(),
            'submitterId': submission.submitter_id,
            'ledgerReferenceNumber': (str(submission.ledger_reference_number)
                                      if submission.ledger_reference_number
                                      else None),
            'ledgerUpdated': submission.ledger_updated,
            'payload': {
                **submission.submitted_payload,
                'ownershipOrControlStatements': [
                    ownership.ownership_json for ownership in submission.ownership_statements],
                'personStatements': submission.person_statements_json
            },
        }
