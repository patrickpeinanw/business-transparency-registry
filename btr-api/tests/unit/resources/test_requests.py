""" Tests to ensure that the submission based end-points work correctly.
"""
import json
import os
from datetime import datetime
from http import HTTPStatus

import pytest
import requests
from dateutil.relativedelta import relativedelta

from btr_api.enums import UserType
from btr_api.models import Request as RequestModel
from btr_api.models import Comment as CommentModel
from btr_api.models import User as UserModel
from btr_api.models.request import RequestSerializer
from btr_api.services import RequestService
from btr_api.services.auth import auth_cache
from btr_api.utils import redact_information

from tests.unit import nested_session
from tests.unit.models.test_user import sample_user
from tests.unit.utils import create_header
from tests.unit.utils.db_helpers import clear_db
from tests.unit.utils.mock_data import REQUEST_DICT, COMMENT_DICT

UPDATE_R_DICT = {
    'fullName': 'edited'
}

@pytest.mark.parametrize(
    'test_name, user_type',
    [('test_get', UserType.STAFF_ROLE)],
)
def test_get(app, client, session, jwt, requests_mock, sample_user, test_name, user_type):
    """Get the plot submissions.
    A parameterized set of tests that runs defined scenarios.
    """
    with nested_session(session):
        clear_db(session)
        session.add(sample_user)
        session.commit()
        # Setup
        id = ''
        req = RequestModel(REQUEST_DICT)
        session.add(req)
        session.commit()
        id = req.uuid

        # Test
        rv = client.get(
            f'/requests/{id}',
            headers=create_header(
                jwt, ['staff'], **{'Accept-Version': 'v1', 'content-type': 'application/json', 'Account-Id': 1}
            ),
        )

        # Confirm outcome
        assert rv.status_code == HTTPStatus.OK

@pytest.mark.parametrize(
    'test_name, roles',
    [('test_get_fail_no_auth', []), ('test_get_fail_no_auth_public', [UserType.USER_PUBLIC]), ('test_get_fail_no_auth_ca', [UserType.USER_COMPETENT_AUTHORITY])],
)
def test_get_fail_no_auth(app, client, session, jwt, requests_mock, sample_user, test_name, roles):
    """Get the plot submissions.
    A parameterized set of tests that runs defined scenarios.
    """
    with nested_session(session):
        clear_db(session)
        # Setup
        id = ''
        req = RequestModel(REQUEST_DICT)
        session.add(req)
        session.commit()
        id = req.uuid

        headers = None
        if roles != None:
          headers = create_header(
                jwt, roles, **{'Accept-Version': 'v1', 'content-type': 'application/json', 'Account-Id': 1}
          )

        # Test
        rv = client.get(
            f'/requests/{id}',
            headers=headers,
        )

        # Confirm outcome
        assert rv.status_code == HTTPStatus.UNAUTHORIZED


@pytest.mark.parametrize(
    'test_name, user_type',
    [('test_post', UserType.STAFF_ROLE)],
)
def test_post(app, client, session, jwt, requests_mock, sample_user, test_name, user_type):
    """Get the plot submissions.
    A parameterized set of tests that runs defined scenarios.
    """
    with nested_session(session):
        clear_db(session)
        session.add(sample_user)
        session.commit()
        
        # Test
        rv = client.post(
            f'/requests',
            json=REQUEST_DICT,
            headers=create_header(
                jwt, ['staff'], **{'Accept-Version': 'v1', 'content-type': 'application/json', 'Account-Id': 1}
            ),
        )

        # Confirm outcome
        assert rv.status_code == HTTPStatus.CREATED


@pytest.mark.parametrize(
    'test_name',
    [('test_post_unauthorized')],
)
def test_post_unauth(app, client, session, jwt, requests_mock, sample_user, test_name):
    """Get the plot submissions.
    A parameterized set of tests that runs defined scenarios.
    """
    with nested_session(session):
        clear_db(session)
        # Test
        rv = client.post(
            f'/requests',
            json=REQUEST_DICT,
        )

        # Confirm outcome
        assert rv.status_code == HTTPStatus.CREATED

@pytest.mark.parametrize(
    'test_name, user_type',
    [('test_put', UserType.STAFF_ROLE)],
)
def test_put(app, client, session, jwt, requests_mock, sample_user, test_name, user_type):
    """Get the plot submissions.
    A parameterized set of tests that runs defined scenarios.
    """
    with nested_session(session):
        clear_db(session)
        session.add(sample_user)
        session.commit()
        
        rv = client.post(
            f'/requests',
            json=REQUEST_DICT,
        )
        id = rv.json['uuid']

        # Test
        rv = client.put(
            f'/requests/{id}',
            json=UPDATE_R_DICT,
            headers=create_header(
                jwt, ['staff'], **{'Accept-Version': 'v1', 'content-type': 'application/json', 'Account-Id': 1}
            ),
        )

        # Confirm outcome
        assert rv.status_code == HTTPStatus.OK

@pytest.mark.parametrize(
    'test_name, roles',
    [('test_put_no_auth', []), ('test_put_no_auth_public', [UserType.USER_PUBLIC]), ('test_put_no_auth_ca', [UserType.USER_COMPETENT_AUTHORITY])],
)
def test_put_no_auth(app, client, session, jwt, requests_mock, sample_user, test_name, roles):
    """Get the plot submissions.
    A parameterized set of tests that runs defined scenarios.
    """
    with nested_session(session):
        clear_db(session)
        # Setup
        rv = client.post(
            f'/requests',
            json=REQUEST_DICT,
        )
        id = rv.json['uuid']
        headers = None
        if roles != None:
          headers = create_header(
                jwt, roles, **{'Accept-Version': 'v1', 'content-type': 'application/json', 'Account-Id': 1}
          )
        # Test
        rv = client.put(
            f'/requests/{id}',
            json=UPDATE_R_DICT,
            headers=headers,
        )

        # Confirm outcome
        assert rv.status_code == HTTPStatus.UNAUTHORIZED

@pytest.mark.parametrize(
    'test_name, user_type',
    [('test_get_comment', UserType.STAFF_ROLE)],
)
def test_get_comment(app, client, session, jwt, requests_mock, sample_user, test_name, user_type):
    """Get the comments.
    A parameterized set of tests that runs defined scenarios.
    """
    with nested_session(session):
        clear_db(session)
        # Setup
        session.add(sample_user)
        session.commit()

        id = ''
        req = RequestModel(REQUEST_DICT)
        session.add(req)
        session.commit()
        id = req.uuid

        c = COMMENT_DICT.copy()
        c['submitter_id'] = sample_user.id
        c['related_uuid'] = id
        com = CommentModel(c)
        session.add(com)
        session.commit()
        # comment_id = com.uuid

        # Test
        rv = client.get(
            f'/requests/{id}/comment',
            headers=create_header(
                jwt, ['staff'], **{'Accept-Version': 'v1', 'content-type': 'application/json', 'Account-Id': 1}
            ),
        )

        # Confirm outcome
        assert rv.status_code == HTTPStatus.OK

@pytest.mark.parametrize(
    'test_name, roles',
    [('test_get_comment_fail_no_auth', []), ('test_get_comment_fail_no_auth_public', [UserType.USER_PUBLIC]), ('test_get_comment_fail_no_auth_ca', [UserType.USER_COMPETENT_AUTHORITY])],
)
def test_get_comment_fail_no_auth(app, client, session, jwt, requests_mock, sample_user, test_name, roles):
    """Get the plot submissions.
    A parameterized set of tests that runs defined scenarios.
    """
    with nested_session(session):
        clear_db(session)
        # Setup
        session.add(sample_user)
        session.commit()

        id = ''
        req = RequestModel(REQUEST_DICT)
        session.add(req)
        session.commit()
        id = req.uuid

        c = COMMENT_DICT.copy()
        c['submitter_id'] = sample_user.id
        c['related_uuid'] = id
        com = CommentModel(c)
        session.add(com)
        session.commit()

        headers = None
        if roles != None:
          headers = create_header(
                jwt, roles, **{'Accept-Version': 'v1', 'content-type': 'application/json', 'Account-Id': 1}
          )

        # Test
        rv = client.get(
            f'/requests/{id}/comment',
            headers=headers,
        )

        # Confirm outcome
        assert rv.status_code == HTTPStatus.UNAUTHORIZED

@pytest.mark.parametrize(
    'test_name, user_type',
    [('test_post_comment', UserType.STAFF_ROLE)],
)
def test_post_comment(app, client, session, jwt, requests_mock, sample_user, test_name, user_type):
    """Get the comments.
    A parameterized set of tests that runs defined scenarios.
    """
    with nested_session(session):
        clear_db(session)
        # Setup
        session.add(sample_user)
        session.commit()

        id = ''
        req = RequestModel(REQUEST_DICT)
        session.add(req)
        session.commit()
        id = req.uuid

        # Test
        rv = client.post(
            f'/requests/{id}/comment',
            json=COMMENT_DICT,
            headers=create_header(
                jwt, ['staff'], **{'Accept-Version': 'v1', 'content-type': 'application/json', 'Account-Id': 1}
            ),
        )

        # Confirm outcome
        assert rv.status_code == HTTPStatus.OK

@pytest.mark.parametrize(
    'test_name, roles',
    [('test_post_comment_fail_no_auth', []), ('test_post_comment_fail_no_auth_public', [UserType.USER_PUBLIC]), ('test_post_comment_fail_no_auth_ca', [UserType.USER_COMPETENT_AUTHORITY])],
)
def test_post_comment_fail_no_auth(app, client, session, jwt, requests_mock, sample_user, test_name, roles):
    """Get the plot submissions.
    A parameterized set of tests that runs defined scenarios.
    """
    with nested_session(session):
        clear_db(session)
        # Setup
        session.add(sample_user)
        session.commit()

        id = ''
        req = RequestModel(REQUEST_DICT)
        session.add(req)
        session.commit()
        id = req.uuid

        headers = None
        if roles != None:
          headers = create_header(
                jwt, roles, **{'Accept-Version': 'v1', 'content-type': 'application/json', 'Account-Id': 1}
          )

        # Test
        rv = client.post(
            f'/requests/{id}/comment',
            json=COMMENT_DICT,
            headers=headers,
        )

        # Confirm outcome
        assert rv.status_code == HTTPStatus.UNAUTHORIZED